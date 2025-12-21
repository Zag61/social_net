import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from 'src/application/services/auth.service';
import { UsersModule } from './users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/infrastructure/auth/jwt.strategy';
import { GoogleStrategy } from 'src/infrastructure/auth/google.strategy';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Берем время жизни токена в секундах из .env
        const expiresInSec = Number(config.get<string>('JWT_EXPIRES_IN')) || 900; // 15 минут
        return {
          secret: config.get<string>('JWT_SECRET') || 'DEV_SECRET',
          signOptions: {
            expiresIn: expiresInSec, // число секунд
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
