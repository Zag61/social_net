import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from 'src/application/services/auth.service';
import { DBModule } from './db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/infrastructure/auth/jwt.strategy';
import { GoogleStrategy } from 'src/infrastructure/auth/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    DBModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
