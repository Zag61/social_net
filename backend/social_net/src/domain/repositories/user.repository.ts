import { User } from "../entities/user";


export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  insert(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');