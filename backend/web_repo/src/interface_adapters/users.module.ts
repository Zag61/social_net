import { Module } from '@nestjs/common';
import { UsersService } from './application/services/users.service';
import { PgUserRepository } from './infrastructure/db/user.repository.pg';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
@Module({
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: PgUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}