// src/application/services/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository';
import type { UserRepository } from 'src/domain/repositories/user.repository';
import { User } from 'src/domain/entities/user';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepo: UserRepository
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findById(id);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    // const validated = CreateUserDtoSchema.parse(dto);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log(hashedPassword);
    const user = new User(
      uuidv4(),
      dto.email,
      hashedPassword,
      dto.nickname,
      undefined,
      undefined
    );
    console.log(user)
    await this.usersRepo.insert(user);
    return user;
  }

  async setVerificationToken(userId: string, token: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new Error('User not found');

    user.verificationToken = token;
    await this.usersRepo.update(user);

  }

  async verifyByToken(token: string) {
    const user = await this.usersRepo.findByVerificationToken(token);
    if (!user) return null;

    user.verified = true;
    user.verificationToken = null;
    await this.usersRepo.update(user);
    return user;
  }
  async getNicknameById(id:string) : Promise<User | null>{
    return this.usersRepo.findById(id);
  }
   async getIdByNickname(nick:string) : Promise<string | null>{
    return this.usersRepo.getIdByNickname(nick);
  }
  async getProfileByNickname(nickname: string, requesterId: string|null) {
    // console.log(nickname);
    let user = await this.usersRepo.findByNickname(nickname);
    if (user == null) { return null; }
    else if (user.id !== (requesterId??'')) {
      const [recentPosts, publicStats] = await Promise.all([
        this.usersRepo.findPostsByTargetUser(user.id, { limit: 20 }),
        this.usersRepo.getPublicData(user.id)
      ]);

      return {
        id: user.id,
        nickname: user.nickname,
        about_info: user.aboutInfo,
        avatar_file_id: user.avatarFileId,
        created_at: user.createdAt,
        publicStats,
        posts: recentPosts.map(p => ({
          id: p.id,
          author_id: p.authorId,
          text: p.text,
          attachments_present: p.attachmentsPresent,
          created_at: p.createdAt,
        }))
      };
    } else {
      const [fullUser, posts, friends] = await Promise.all([
        this.usersRepo.findFullById(user.id),           // includes private columns
        this.usersRepo.findPostsByTargetUser(user.id, { limit: 20 }),
        this.usersRepo.findAcceptedFriends(user.id)     // list of friend user objects
      ]);

      // Don't return password_hash, verification_token, etc. — filter sensitive fields here.

      return {
        fullUser, posts, friends

      };
    }
  }
}