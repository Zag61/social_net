import { Module, forwardRef } from '@nestjs/common';
import { MessagesController } from 'src/interfaces/controllers/messages.controller';
import { MessagingService } from 'src/application/services/messaging.service';
import { MESSAGE_REPOSITORY } from 'src/domain/repositories/message.repository';
import { POSTGRES_POOL, PostgresPoolProvider } from '../providers/postgres.provider';
import { UsersModule } from './users.module';
import { PgMessageRepository } from 'src/infrastructure/persistence/message.repository.pg';
import { Pool } from 'pg';
import {  PgFilesRepository } from 'src/infrastructure/persistence/files.repository.pg';
import {  PgMessageFilesRepository } from 'src/infrastructure/persistence/message-files.repository.pg';
import { FILES_REPOSITORY } from 'src/domain/repositories/files.repository';
import { MESSAGE_FILES_REPOSITORY } from 'src/domain/repositories/message-files.repository';
import { S3Service } from 'src/application/services/s3.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [MessagesController],
  providers: [
    MessagingService,
    S3Service,
    PostgresPoolProvider,
    {
      provide: MESSAGE_REPOSITORY,
      useFactory: (pool: Pool) => new PgMessageRepository(pool),
      inject: [POSTGRES_POOL],
    },
    {
      provide: FILES_REPOSITORY,
      useFactory: (pool: Pool) => new PgFilesRepository(pool),
      inject: [POSTGRES_POOL],
    },
    {
      provide: MESSAGE_FILES_REPOSITORY,
      useFactory: (pool: Pool) => new PgMessageFilesRepository(pool),
      inject: [POSTGRES_POOL],
    },
  ],
  exports: [MessagingService, MESSAGE_REPOSITORY, FILES_REPOSITORY, MESSAGE_FILES_REPOSITORY],
})
export class MessagesModule {}
