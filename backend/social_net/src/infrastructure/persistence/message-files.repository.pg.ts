// src/infrastructure/persistence/message-files.repository.pg.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { MessageFilesRepository, MessageFileEntity } from 'src/domain/repositories/message-files.repository';
import { POSTGRES_POOL } from 'src/interfaces/providers/postgres.provider';

@Injectable()
export class PgMessageFilesRepository implements MessageFilesRepository {
  private readonly logger = new Logger(PgMessageFilesRepository.name);

  constructor(@Inject(POSTGRES_POOL) private readonly pool: Pool) {}

  async create(data: Omit<MessageFileEntity, 'id' | 'attached_at'>): Promise<MessageFileEntity> {
    const id = uuidv4();
    const attached_at = new Date();
    const query = `
      INSERT INTO message_files (id, message_id, file_id, attached_at)
      VALUES ($1,$2,$3,$4)
      RETURNING *
    `;
    const params = [id, data.message_id, data.file_id, attached_at];

    try {
      const { rows } = await this.pool.query(query, params);
      return rows[0] as MessageFileEntity;
    } catch (err) {
      this.logger.error('Failed to link file to message', err);
      throw err;
    }
  }

  async findByMessageId(messageId: string): Promise<MessageFileEntity[]> {
    const query = `SELECT * FROM message_files WHERE message_id = $1 ORDER BY attached_at ASC`;
    const { rows } = await this.pool.query(query, [messageId]);
    return rows as MessageFileEntity[];
  }
}
