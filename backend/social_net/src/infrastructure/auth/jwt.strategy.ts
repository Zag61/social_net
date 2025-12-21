// src/interfaces/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/application/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'DEV_SECRET',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const user = await this.usersService.findById(userId);
    // Возвращаем минимальный объект пользователя, который попадёт в req.user
    return { id: userId, nickname: user?.nickname ?? null };
  }
}
