// src/application/services/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository';
import type { UserRepository } from 'src/domain/repositories/user.repository';
import { User } from 'src/domain/entities/user';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CreateUserDto, CreateUserDtoSchema } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepo: UserRepository
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findById(id);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    // const validated = CreateUserDtoSchema.parse(dto);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new User(
      uuidv4(),
      dto.email,
      hashedPassword,
      dto.nickname,
      undefined,
      undefined
    );
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
  user.verificationToken  = null;
  await this.usersRepo.update(user);
  return user;
}

}