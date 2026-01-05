// src/messages/messages.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CreateMessageSchema } from 'src/application/dto/create-message.dto';
import { MessagingService } from 'src/application/services/messaging.service';
import { CurrentUser, type UserPayload } from 'src/infrastructure/current-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { GetMessagesSchema } from 'src/application/dto/get.messages.schema';
import { S3Service } from 'src/application/services/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { type CreateMessageWithFileDto, CreateMessageWithFileSchema } from 'src/application/dto/create-message-with-file.schema';
import { FileRecord } from 'src/infrastructure/persistence/dao/fileDAO';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messaging: MessagingService,
    private readonly s3: S3Service,
  ) {}
  @Post()
@HttpCode(HttpStatus.CREATED)
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 10 * 1024 * 1024 }, // example: 10 MB
}))
async sendMessage(
  @CurrentUser() user: UserPayload,
  @Body(new ZodValidationPipe(CreateMessageSchema)) dto: { receiverId: string; text: string },
  @UploadedFile() file?: Express.Multer.File,
) {
  const { receiverId, text } = dto;
  const result = await this.messaging.sendMessage({
    senderId: user.id,
    receiverId,
    text,
    file, // undefined if none
  });

  return { id: result.id, sentAt: result.sentAt };
}

  @Get()
async getMessages(
  @CurrentUser() user: UserPayload,
  @Query(new ZodValidationPipe(GetMessagesSchema)) query: unknown,
) {
  const { peerId, limit } = query as { peerId: string; limit: number };
  const messages = await this.messaging.getConversation(
    user.id,
    peerId,
    limit,
  );

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
