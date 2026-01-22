// src/messages/messages.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Query, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CreateMessageSchema } from 'src/application/dto/create-message.dto';
import { MessagingService } from 'src/application/services/messaging.service';
import { CurrentUser, type UserPayload } from 'src/infrastructure/current-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { GetMessagesSchema } from 'src/application/dto/get.messages.schema';
import { S3Service } from 'src/application/services/s3.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from 'src/application/services/users.service';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messaging: MessagingService,
    private readonly s3: S3Service,
    private readonly userService: UsersService
  ) { }
  @Post()
  @HttpCode(HttpStatus.CREATED)
 @UseInterceptors(FilesInterceptor('files', 10, { // <-- 'files' field, max 10 files
  limits: { fileSize: 10 * 1024 * 1024 *1024}, // 10 MB
}))
  async sendMessage(
    @CurrentUser() user: UserPayload,
    // @Body(new ZodValidationPipe(CreateMessageSchema)) dto: { receiverNickname: string; text: string },
    @Body() dto: { receiverNickname: string; text: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { receiverNickname, text } = dto;
    const receiverId = await this.userService.getIdByNickname(receiverNickname);
    if (!receiverId) throw new Error('Receiver not found');

    // Map Multer files to the shape expected by MessagingService
    const formattedFiles = files?.map(f => ({
      buffer: f.buffer,
      mimetype: f.mimetype,
      originalname: f.originalname,
    }));

    const result = await this.messaging.sendMessage({
      senderId: user.id,
      receiverId,
      text,
      files: formattedFiles,
    });

     return {
      id: result.message.id,
      senderId: result.message.senderId,
      receiverId: result.message.receiverId,
      text: result.message.text,
      sentAt: result.message.sentAt,
      editedAt: result.message.getEditedAt,
      files: result.attachedFiles, // this now includes all uploaded files with {id, name, url}
    };
  }

  @Get()
  async getMessages(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(GetMessagesSchema)) query: unknown,
  ) {
    const { peerNickname, limit } = query as { peerNickname: string; limit: number };
    // console.log(peerNickname, limit)
    const peerId =  await this.userService.getIdByNickname(peerNickname);
    const messages = await this.messaging.getConversation(
      user.id,
      peerId ?? '',
      limit,
    );
    // console.log(messages)
    return messages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      text: m.text,
      sentAt: m.sentAt,
      editedAt: m.editedAt,
      files: m.files,
    }));
  }

}
