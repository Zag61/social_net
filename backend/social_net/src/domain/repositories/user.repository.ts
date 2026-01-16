import { PublicData, PublicUser } from "src/application/dto/user.dto";
import { User } from "../entities/user";
import { PostSummary } from "src/application/dto/post.dto";


export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  insert(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findByVerificationToken(token: string): Promise<User | null>;
  setVerificationToken(userId: string, token: string): Promise<void>;
  markVerified(userId: string): Promise<void>;
  findFullById(id: string): Promise<User | null>;
  findAcceptedFriends(userId: string): Promise<PublicUser[]>;
  getPublicData(userId: string): Promise<PublicData>;
  findPublicByNickname(nickname: string): Promise<PublicUser | null>;
  findPostsByTargetUser(userId: string, opts?: { limit?: number }): Promise<PostSummary[]>;
  getIdByNickname(nickname: string): Promise<string | null> 
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');