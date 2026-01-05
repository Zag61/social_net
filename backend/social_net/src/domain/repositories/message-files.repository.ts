import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const MESSAGE_FILES_REPOSITORY = 'MESSAGE_FILES_REPOSITORY';

export type MessageFileEntity = {
  id: string;
  message_id: string;
  file_id: string;
  attached_at?: Date;
};

export interface MessageFilesRepository {
  create(data: Omit<MessageFileEntity, 'id' | 'attached_at'>): Promise<MessageFileEntity>;
  findByMessageId(messageId: string): Promise<MessageFileEntity[]>;
}

// Example in-memory implementation (dev)
@Injectable()
export class InMemoryMessageFilesRepository implements MessageFilesRepository {
  private records: MessageFileEntity[] = [];

  async create(data: Omit<MessageFileEntity, 'id' | 'attached_at'>) {
    const rec: MessageFileEntity = {
      ...data,
      id: uuidv4(),
      attached_at: new Date(),
    };
    this.records.push(rec);
    return rec;
  }

  async findByMessageId(messageId: string) {
    return this.records.filter((r) => r.message_id === messageId);
  }
}
