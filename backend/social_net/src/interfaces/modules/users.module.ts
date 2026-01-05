// src/interfaces/modules/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from 'src/application/services/users.service';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository';
import { PostgresPoolProvider, POSTGRES_POOL } from '../providers/postgres.provider';
import { PgUserRepository } from 'src/infrastructure/db/user.repository.pg';

@Module({
  providers: [
    UsersService,
    PostgresPoolProvider,
    {
      provide: USER_REPOSITORY,
      useFactory: (pool) => new PgUserRepository(pool),
      inject: [POSTGRES_POOL],
    },
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule {}
