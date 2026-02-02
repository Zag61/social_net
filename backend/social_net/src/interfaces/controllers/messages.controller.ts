// src/messages/messages.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Query, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/auth.guard';
import { MessagingService } from 'src/application/services/messaging.service';
import { CurrentUser, type UserPayload } from 'src/infrastructure/current-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { GetMessagesSchema } from 'src/application/dto/get.messages.schema';
import { S3Service } from 'src/application/services/s3.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from 'src/application/services/users.service';
import { MessagesGateway } from '../gateways/message.gateway';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messaging: MessagingService,
    private readonly s3: S3Service,
    private readonly userService: UsersService,
    private readonly messagesGateway: MessagesGateway,
  ) { }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10, { // <-- 'files' field, max 10 files
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1 gb
  }))
  async sendMessage(
    @CurrentUser() user: UserPayload,
    @Body() dto: { receiverNickname: string; text: string, tempId?: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const { receiverNickname, text, tempId } = dto;
    const receiverId = await this.userService.getIdByNickname(receiverNickname);
    if (!receiverId) throw new Error('Receiver not found');

    const formattedFiles = files?.map(f => ({
      buffer: f.buffer,
      mimetype: f.mimetype,
      originalname: Buffer.from(f.originalname, 'latin1').toString('utf8'),
    }));
    const result = await this.messaging.sendMessage({
      senderId: user.id,
      receiverId,
      text,
      files: formattedFiles,
    });

    const payload = {
      id: result.message.id,
      senderId: result.message.senderId,
      receiverId: result.message.receiverId,
      text: result.message.text,
      sentAt: result.message.sentAt,
      editedAt: result.message.getEditedAt ? result.message.getEditedAt() : undefined,
      attachments: result.attachedFiles, // [{id,name,url}, ...]
      tempId: tempId ?? null,
      status: 'sent'
    };
    // emit to both sender and receiver
    this.messagesGateway.emitMessage(payload);

    // return minimal ack if you want (client should rely on WS)
    return { ok: true, tempId: tempId ?? null };
  }

  @Get()
  async getMessages(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(GetMessagesSchema)) query: unknown,
  ) {
    const { peerNickname, limit } = query as { peerNickname: string; limit: number };
    // console.log(peerNickname, limit)
    const peerId = await this.userService.getIdByNickname(peerNickname);
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
      attachments: m.files,
    }));
  }

  @Get('chats')
  async getChats() { }
}
