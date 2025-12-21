import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from 'src/domain/entities/user';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { UserRow, UserRowSchema } from '../persistence/dao/userDAO';
@Injectable()
export class PgUserRepository implements UserRepository {
  private readonly logger = new Logger(PgUserRepository.name);

  constructor(private readonly pool: Pool) {}

  private mapRowToEntity(row: UserRow): User {
    return new User(
      row.id,
      row.email,
      row.password_hash,
      row.nickname,
      row.about_info ?? '',
      row.phone_number ?? undefined,
      row.avatar_file_id ?? undefined
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const q = `
      SELECT id, email, password_hash, nickname, about_info, phone_number, avatar_file_id
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const { rows } = await this.pool.query(q, [email]);
    const row = rows[0];
    if (!row) return null;

    const parsed = UserRowSchema.parse(row); // Zod валидация
    return this.mapRowToEntity(parsed);
  }

  async findById(id: string): Promise<User | null> {
    const q = `
      SELECT id, email, password_hash, nickname, about_info, phone_number, avatar_file_id
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await this.pool.query(q, [id]);
    const row = rows[0];
    if (!row) return null;

    const parsed = UserRowSchema.parse(row);
    return this.mapRowToEntity(parsed);
  }

  async insert(user: User): Promise<void> {
    const q = `
      INSERT INTO users (id, password_hash, nickname, email, about_info, phone_number, avatar_file_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await this.pool.query(q, [
      user.id,
      user.passwordHash,
      user.nickname,
      user.email,
      user.aboutInfo ?? null,
      user.phoneNumber ?? null,
      user.avatarFileId ?? null
    ]);
  }

  async update(user: User): Promise<void> {
    const q = `
      UPDATE users
      SET password_hash = $2, nickname = $3, about_info = $4, phone_number = $5, avatar_file_id = $6
      WHERE id = $1
    `;
    await this.pool.query(q, [
      user.id,
      user.passwordHash,
      user.nickname,
      user.aboutInfo ?? null,
      user.phoneNumber ?? null,
      user.avatarFileId ?? null
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  }
}
