// src/infrastructure/persistence/message.repository.pg.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Message } from 'src/domain/entities/message';
import { MessageRepository } from 'src/domain/repositories/message.repository';
import { POSTGRES_POOL } from 'src/interfaces/providers/postgres.provider';

@Injectable()
export class PgMessageRepository implements MessageRepository {
  private readonly logger = new Logger(PgMessageRepository.name);

  constructor(@Inject(POSTGRES_POOL) private readonly pool: Pool) {}

  nextId(): string {
    return uuidv4();
  }

  /**
   * Insert message. Decides whether to populate receiver_user_id or receiver_channel_id
   * by checking existence of a channel with the receiverId. If a channel exists with
   * that id, inserts into receiver_channel_id, otherwise into receiver_user_id.
   *
   * NOTE: this does an extra SELECT on `channels` to determine receiver type.
   * For better performance / determinism, adapt Message to include receiverType
   * or provide separate service methods for user/channel messages.
   */
  async add(message: Message): Promise<void> {
    // decide receiver type by checking channels table
    let isChannel = false;
    try {
      const { rowCount } = await this.pool.query(
        `SELECT 1 FROM channels WHERE id = $1 LIMIT 1`,
        [message.receiverId],
      );
      isChannel = (rowCount??0) > 0;
    } catch (err) {
      this.logger.warn('Failed to check channels table to determine receiver type; assuming user receiver', err);
      isChannel = false;
    }

    const insertSql = `
      INSERT INTO messages (
        id, sender_id, receiver_user_id, receiver_channel_id, text, sent_at, edited_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const receiverUserId = isChannel ? null : message.receiverId;
    const receiverChannelId = isChannel ? message.receiverId : null;

    const params = [
      message.id,
      message.senderId,
      receiverUserId,
      receiverChannelId,
      message.text,
      message.sentAt,
      message.getEditedAt?.() ?? null,
    ];

    try {
      await this.pool.query(insertSql, params);
    } catch (err) {
      this.logger.error('Failed to insert message', err);
      throw err;
    }
  }

  /**
   * Return the last `limit` messages between two *users* (sender/receiver_user pair).
   * Results are ordered newest->oldest to match previous interface; caller may reverse
   * to get chronological ascending order.
   */
  async getLastBetweenUsers(userA: string, userB: string, limit: number): Promise<Message[]> {
    const query = `
      SELECT id, sender_id, receiver_user_id, receiver_channel_id, text, sent_at, edited_at
      FROM messages
      WHERE
        -- only consider user-to-user messages (receiver_user_id IS NOT NULL)
        (
          (sender_id = $1 AND receiver_user_id = $2)
          OR
          (sender_id = $2 AND receiver_user_id = $1)
        )
      ORDER BY sent_at DESC
      LIMIT $3
    `;
    const { rows } = await this.pool.query(query, [userA, userB, limit]);

    return rows.map((r: any) => {
      const receiverId = r.receiver_user_id ?? r.receiver_channel_id;
      return new Message(
        r.id,
        r.sender_id,
        receiverId,
        r.text,
        new Date(r.sent_at),
        // r.edited_at ? new Date(r.edited_at) : undefined,
      );
    });
  }

  /**
   * OPTIONAL helper: fetch last messages in a channel (if you later need it).
   * Kept here as a convenience.
   */
  async getLastInChannel(channelId: string, limit: number): Promise<Message[]> {
    const q = `
      SELECT id, sender_id, receiver_user_id, receiver_channel_id, text, sent_at, edited_at
      FROM messages
      WHERE receiver_channel_id = $1
      ORDER BY sent_at DESC
      LIMIT $2
    `;
    const { rows } = await this.pool.query(q, [channelId, limit]);
    return rows.map((r: any) =>
      new Message(
        r.id,
        r.sender_id,
        r.receiver_user_id ?? r.receiver_channel_id,
        r.text,
        new Date(r.sent_at),
      ),
    );
  }
}
