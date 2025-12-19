import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/services/auth.service';
import { UsersModule } from './users.module';


@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'DEV_SECRET', 
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}