import { User } from "src/domain/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');