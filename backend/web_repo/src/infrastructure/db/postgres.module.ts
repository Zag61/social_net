import { Module } from "@nestjs/common";
import { UsersService } from "src/application/services/users.service";
import { PgUserRepository } from "./user.repository.pg";

@Module({
  providers: [
  UsersService,
  { provide: PgUserRepository, useClass: PgUserRepository },
]
})
export class PostgresModule {}
