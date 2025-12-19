import { Injectable } from "@nestjs/common";
import { User } from "src/domain/entities/user";
import { UserRepository } from "src/domain/repositories/user.repository";

@Injectable()
export class PgUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // return null;
    return new User('1', 'hashhash', 'nick', 'ddd', '+7 993 550 37 88', '')
  }
}