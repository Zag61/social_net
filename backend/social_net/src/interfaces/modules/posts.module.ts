import { Module } from '@nestjs/common';
import { PostgresPoolProvider, POSTGRES_POOL } from '../providers/postgres.provider';
import { S3Service } from 'src/application/services/s3.service';
import { PostsController } from '../controllers/posts.controller';
import { UsersModule } from './users.module';
import { DBModule } from './db.module';

@Module({
  imports: [UsersModule, DBModule],
  controllers: [PostsController]
})
export class PostsModule { }
