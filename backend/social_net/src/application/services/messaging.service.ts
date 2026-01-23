import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { MESSAGE_REPOSITORY, type MessageRepository } from 'src/domain/repositories/message.repository';
import { USER_REPOSITORY, type UserRepository } from 'src/domain/repositories/user.repository';
import { FILES_REPOSITORY, type FilesRepository } from 'src/domain/repositories/files.repository';
import { MESSAGE_FILES_REPOSITORY, type MessageFilesRepository } from 'src/domain/repositories/message-files.repository';
import { S3Service } from './s3.service';
import xss from 'xss';
import { Message } from 'src/domain/entities/message';
import { FileRecord } from 'src/infrastructure/persistence/dao/fileDAO';
import { UploadedFile } from '../dto/file.dto';

@Injectable()
export class MessagingService {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly messages: MessageRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(FILES_REPOSITORY) private readonly files: FilesRepository,
    @Inject(MESSAGE_FILES_REPOSITORY) private readonly messageFiles: MessageFilesRepository,
    private readonly s3: S3Service,
  ) { }

  /** 
   * Send a message, optionally with a file
   */
  async sendMessage(params: {
    senderId: string;
    receiverId: string;
    text: string;
    files?: { buffer: Buffer; mimetype: string; originalname: string }[];
  }) {
    const { senderId, receiverId, text, files } = params;

    const receiver = await this.users.findById(receiverId);
    if (!receiver) throw new NotFoundException('Receiver not found');

    const safeText = xss(text);
    const message = new Message(this.messages.nextId(), senderId, receiverId, safeText, new Date());
    await this.messages.add(message);

    let attachedFiles: UploadedFile[] = [];
    // Handle optional file
    if (files && files.length > 0) {
      // Upload all files in parallel
      attachedFiles = await Promise.all(
        files.map(async (file) => {
          const key = `messages/${senderId}/${message.id}_${Date.now()}_${file.originalname}`;
          const uploaded = await this.s3.uploadFile(key, file.buffer, file.mimetype);
          const fileRecord = await this.attachFile(uploaded, senderId, file.originalname);
          await this.linkFileToMessage(message.id, fileRecord.id);
          const url = await this.s3.getPresignedDownloadUrl(fileRecord.storage_bucket!, fileRecord.storage_key!);
          return {
            id: fileRecord.id,
            name: file.originalname,
            url,
          };
        })
      );

    }

    return { message, attachedFiles };
  }

  /** 
   * Retrieve conversation with files
   */
  async getConversation(userId: string, peerId: string, limit = 50) {
    const messagesDesc = await this.messages.getLastBetweenUsers(userId, peerId, limit);
    const messages = messagesDesc.slice().reverse();

    return Promise.all(
      messages.map(async (msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        sentAt: msg.sentAt,
        editedAt: msg.getEditedAt?.(),
        files: await this.getFilesWithUrls(msg.id),
      })),
    );
  }

  /** --- Private helpers --- */

  private async attachFile(uploaded: { storage_bucket: string; storage_key: string }, ownerId: string, name: string): Promise<FileRecord> {
    // const name = uploaded.storage_key.split('/').pop();
    if (!name) throw new Error('Invalid storage key: cannot determine file name');
    console.log('filename ' + name)
    return this.files.create({
      owner_id: ownerId,
      name: name,
      backend: 'object_storage',
      storage_bucket: uploaded.storage_bucket,
      storage_key: uploaded.storage_key,
      size_bytes: 0, // optional: could pass real file size if available
    });
  }

  private async linkFileToMessage(messageId: string, fileId: string) {
    return this.messageFiles.create({ message_id: messageId, file_id: fileId });
  }

  private async getFilesWithUrls(messageId: string) {
    const links = await this.messageFiles.findByMessageId(messageId);
    const files = await Promise.all(
      links.map(async (l) => {
        const f = await this.files.findById(l.file_id);
        if (!f || !f.storage_bucket || !f.storage_key) return null;
        const url = await this.s3.getPresignedDownloadUrl(f.storage_bucket, f.storage_key);
        return { id: f.id, name: f.name, url };
      }),
    );

    return files.filter(Boolean);
  }
}
