import { Module } from "@nestjs/common";
import { UsersController } from "../controllers/users.controller";
import { UsersService } from "src/application/services/users.service";
import { DBModule } from "./db.module";
import { USER_REPOSITORY } from "src/domain/repositories/user.repository";
import { POSTGRES_POOL } from "../providers/postgres.provider";
import { S3Service } from "src/application/services/s3.service";
import { Pool } from "pg";
import { PgUserRepository } from "src/infrastructure/persistence/user.repository.pg";
import { PresenceService } from "src/application/services/presence.service";
import { PresenceGateway } from "../gateways/presence.gateway";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [UsersService,
        JwtService,
        PresenceService,
        PresenceGateway,
    {
        provide: USER_REPOSITORY,
        useFactory: (pool: Pool, s3: S3Service) =>
            new PgUserRepository(pool, s3),
        inject: [POSTGRES_POOL, S3Service],
    },
    ],
    imports: [DBModule],
    controllers: [UsersController],
    exports: [UsersService, USER_REPOSITORY, PresenceService]
})
export class UsersModule { }
