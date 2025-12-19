import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY} from "src/domain/repositories/user.repository";
import type { UserRepository } from "src/domain/repositories/user.repository";

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: UserRepository) {}

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }
}

