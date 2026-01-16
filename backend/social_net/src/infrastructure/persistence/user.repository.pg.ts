import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from 'src/domain/entities/user';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { UserRow, UserRowSchema } from './dao/userDAO';
import { PostSummary } from 'src/application/dto/post.dto';
import { PublicData, PublicUser } from 'src/application/dto/user.dto';
@Injectable()
export class PgUserRepository implements UserRepository {
  private readonly logger = new Logger(PgUserRepository.name);

  constructor(private readonly pool: Pool) { }

  private mapRowToEntity(row: UserRow): User {
    return new User(
      row.id,
      row.email ?? '',
      row.password_hash??'',
      row.nickname,
      row.about_info ?? undefined,
      row.phone_number ?? undefined,
      row.avatar_file_id ?? undefined,
      row.verified ?? false,
      row.verification_token ?? undefined
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const q = `
      SELECT id, email, password_hash, nickname, about_info, phone_number, avatar_file_id, verified
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

  async findByNickname(nickname: string): Promise<User | null> {
    const q = `
      SELECT id, email, password_hash, nickname, about_info, phone_number, avatar_file_id, verified
      FROM users
      WHERE nickname = $1
      LIMIT 1
    `;
    const { rows } = await this.pool.query(q, [nickname]);
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
  async getIdByNickname(nickname: string): Promise<string | null> {
    const q = `
      SELECT id
      FROM users
      WHERE nickname = $1
    `;
    const { rows } = await this.pool.query(q, [nickname]);
    const row = rows[0];
    if (!row) return null;
    return row.id;
  }

  async insert(user: User): Promise<void> {
    const q = `
    INSERT INTO users (id, password_hash, nickname, email, about_info, phone_number, avatar_file_id, verified, verification_token)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  `;
    await this.pool.query(q, [
      user.id,
      user.passwordHash,
      user.nickname,
      user.email,
      user.aboutInfo ?? null,
      user.phoneNumber ?? null,
      user.avatarFileId ?? null,
      user.verified ?? false,
      user.verificationToken ?? null
    ]);
  }


  async update(user: User & { verificationToken?: string | null; verified?: boolean }): Promise<void> {
    const q = `
    UPDATE users
    SET 
      password_hash = $2,
      nickname = $3,
      about_info = $4,
      phone_number = $5,
      avatar_file_id = $6,
      verification_token = $7,
      verified = $8
    WHERE id = $1
  `;

    await this.pool.query(q, [
      user.id,
      user.passwordHash,
      user.nickname,
      user.aboutInfo ?? null,
      user.phoneNumber ?? null,
      user.avatarFileId ?? null,
      user.verificationToken ?? null,
      user.verified ?? false,
    ]);
  }


  async delete(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const q = `SELECT id, email, nickname, about_info, phone_number, avatar_file_id, verified
             FROM users WHERE verification_token = $1 LIMIT 1`;
    const { rows } = await this.pool.query(q, [token]);
    const row = rows[0];
    if (!row) return null;
    const parsed = UserRowSchema.parse(row);
    return this.mapRowToEntity(parsed);
  }

  // new method: set token
  async setVerificationToken(userId: string, token: string): Promise<void> {
    await this.pool.query(
      `UPDATE users SET verification_token = $2 WHERE id = $1`,
      [userId, token]
    );
  }

  // new method: mark verified
  async markVerified(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE users SET verified = true, verification_token = NULL WHERE id = $1`,
      [userId]
    );
  }

  async findPublicByNickname(nickname: string): Promise<PublicUser> {
    const q = `
      SELECT id, nickname, about_info, avatar_file_id, created_at
      FROM users
      WHERE nickname = $1
      LIMIT 1
    `;
    try {
      const { rows } = await this.pool.query(q, [nickname]);
      const row = rows[0];
      return {
        id: row.id,
        nickname: row.nickname,
        aboutInfo: row.about_info ?? null,
        avatarFileId: row.avatar_file_id ?? null,
        createdAt: row.created_at
      };
    } catch (err) {
      this.logger.error({ msg: 'findPublicByNickname failed', nickname, err });
      throw err;
    }
  }

  /**
   * Return full user row by id (includes private columns).
   * Caller should strip sensitive fields before returning to clients.
   */
  async findFullById(id: string): Promise<User | null> {
    const q = `
      SELECT id, email, password_hash, nickname, about_info, phone_number, avatar_file_id, verified, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    try {
      const { rows } = await this.pool.query(q, [id]);
      const row = rows[0];
      if (!row) return null;
      const parsed = UserRowSchema.parse(row);
      return this.mapRowToEntity(parsed);
    } catch (err) {
      this.logger.error({ msg: 'findFullById failed', id, err });
      throw err;
    }
  }

  /**
   * Get latest posts published on user's personal page (target_user_id = userId).
   * Options: { limit }
   */
  async findPostsByTargetUser(userId: string, opts?: { limit?: number }): Promise<PostSummary[]> {
    const limit = opts?.limit ?? 20;
    const q = `
      SELECT id, author_id, text_f, attachments_present, created_at
      FROM posts
      WHERE author_id = $1 AND deleted = false
      ORDER BY created_at DESC
      LIMIT $2
    `;
    try {
      const { rows } = await this.pool.query(q, [userId, limit]);
      return rows.map((r: any) => ({
        id: r.id,
        authorId: r.author_id,
        text: r.text_f,
        attachmentsPresent: r.attachments_present,
        createdAt: r.created_at
      }));
    } catch (err) {
      this.logger.error({ msg: 'findPostsByTargetUser failed', userId, err });
      throw err;
    }
  }

  /**
   * Public stats: number of posts (personal page) and accepted friends count.
   */
  async getPublicData(userId: string): Promise<PublicData> {
    const q = `
      SELECT
        u.nickname,
        u.created_at,
        u.about_info,
        (SELECT COUNT(*)
        FROM posts p
        WHERE p.author_id = u.id
          AND p.deleted = false) AS posts_count,
        (SELECT COUNT(*)
        FROM friendships f
        WHERE (f.requester_id = u.id OR f.addressee_id = u.id)
          AND f.status = 'accepted') AS friends_count
      FROM users u
      WHERE u.id = $1;

    `;
    try {
      const { rows } = await this.pool.query(q, [userId]);
      const row = rows[0];
      return {
        postsCount: parseInt(row.posts_count?.toString() ?? '0', 10),
        friendsCount: parseInt(row.friends_count?.toString() ?? '0', 10),
        nickname: row.nickname,
        created_at: row.created_at,
        aboutInfo: row.about_info
      };
    } catch (err) {
      this.logger.error({ msg: 'getPublicData failed', userId, err });
      throw err;
    }
  }

  /**
   * Return accepted friends as user summaries (the "other" user in the friendship).
   */
  async findAcceptedFriends(userId: string): Promise<PublicUser[]> {
    const q = `
      SELECT u.id, u.nickname, u.about_info, u.avatar_file_id, u.created_at
      FROM friendships f
      JOIN users u ON (
        (f.requester_id = $1 AND u.id = f.addressee_id)
        OR
        (f.addressee_id = $1 AND u.id = f.requester_id)
      )
      WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
      ORDER BY u.nickname
    `;
    try {
      const { rows } = await this.pool.query(q, [userId]);
      return rows.map((r: any) => ({
        id: r.id,
        nickname: r.nickname,
        aboutInfo: r.about_info ?? null,
        avatarFileId: r.avatar_file_id ?? null,
        createdAt: r.created_at
      }));
    } catch (err) {
      this.logger.error({ msg: 'findAcceptedFriends failed', userId, err });
      throw err;
    }
  }

}
