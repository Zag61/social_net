// src/infrastructure/persistence/files.repository.pg.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { FilesRepository } from 'src/domain/repositories/files.repository';
import { POSTGRES_POOL } from 'src/interfaces/providers/postgres.provider';
import { FileDto } from './dao/file.dto';

@Injectable()
export class PgFilesRepository implements FilesRepository {
  private readonly logger = new Logger(PgFilesRepository.name);

  constructor(@Inject(POSTGRES_POOL) private readonly pool: Pool) {}

  async create(data: Omit<FileDto, 'id' | 'created_at'>): Promise<FileDto> {
    const id = uuidv4();
    const created_at = new Date();

    const query = `
      INSERT INTO files
        (id, owner_id, name, backend, storage_bucket, storage_key, size_bytes, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;
    const params = [
      id,
      data.owner_id,
      data.name,
      data.backend,
      data.storage_bucket ?? null,
      data.storage_key ?? null,
      data.size_bytes,
      created_at,
    ];

    try {
      const { rows } = await this.pool.query(query, params);
      return rows[0] as FileDto;
    } catch (err) {
      this.logger.error('Failed to insert file', err);
      throw err;
    }
  }

  async findById(id: string): Promise<FileDto | null> {
    const query = `SELECT * FROM files WHERE id = $1`;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] ? (rows[0] as FileDto) : null;
  }
}
