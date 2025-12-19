import { User } from "src/domain/user";
import { UserRepository } from "src/infrastructure/persistence/repositories/user.repository";
export declare class PgUserRepository implements UserRepository {
    findByEmail(email: string): Promise<User | null>;
}
export declare const USER_REPOSITORY: unique symbol;
