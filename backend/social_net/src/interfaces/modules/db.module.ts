import { Module } from '@nestjs/common';
import { UsersService } from 'src/application/services/users.service';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository';
import { PostgresPoolProvider, POSTGRES_POOL } from '../providers/postgres.provider';
import { PgUserRepository } from 'src/infrastructure/persistence/user.repository.pg';
import { S3Service } from 'src/application/services/s3.service';
import { Pool } from 'pg';

@Module({
  providers: [
    PostgresPoolProvider,
    S3Service,
  ],
  exports: [POSTGRES_POOL, S3Service],
})
export class DBModule { }
