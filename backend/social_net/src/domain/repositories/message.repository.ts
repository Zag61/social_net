// src/domain/repositories/message.repository.ts
import { Message } from 'src/domain/entities/message';
export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';
export interface MessageRepository {
  nextId(): string; // or UUID generator elsewhere
  add(message: Message): Promise<void>;
  // optionally: findById, listByConversation, markRead, etc.
  getLastBetweenUsers(userA: string, userB: string, limit: number): Promise<Message[]>;
}
