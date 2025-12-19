import { PgUserRepository } from "src/infrastructure/db/user.repository.pg";
export declare class UsersService {
    private readonly repo;
    constructor(repo: PgUserRepository);
    findByEmail(email: string): Promise<import("../domain/user").User | null>;
}
