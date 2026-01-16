// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DBModule } from './db.module';
import { AuthModule } from './auth.module';
import { MessagesModule } from './messages.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    DBModule,
    AuthModule,   
    MessagesModule,
    UsersModule
  ],
})
export class AppModule {}
