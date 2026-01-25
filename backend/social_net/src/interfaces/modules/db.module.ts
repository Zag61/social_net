import { Module } from '@nestjs/common';
import { PostgresPoolProvider, POSTGRES_POOL } from '../providers/postgres.provider';
import { S3Service } from 'src/application/services/s3.service';

@Module({
  providers: [
    PostgresPoolProvider,
    S3Service,
  ],
  exports: [POSTGRES_POOL, S3Service],
})
export class DBModule { }
