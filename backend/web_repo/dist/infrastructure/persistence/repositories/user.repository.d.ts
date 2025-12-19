import { User } from "src/domain/user";
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
}
