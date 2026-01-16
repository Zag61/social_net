// src/interfaces/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/application/services/users.service';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService
  ) {
    super({
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
     (req) => {
    const cookie = req?.headers?.cookie;
    if (!cookie) return null;

    const match = cookie
      .split('; ')
      .find(c => c.startsWith('access_token='));

    if (!match) return null;

    const token = match.split('=')[1];
    if (!token || token.trim() === '') return null;
    return token;
    },
  ]),
  secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
});
  }

  async validate(payload: any) {
    const userId = payload.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
    // no such user -> treat as unauthenticated
    return null;
    }
    // Возвращаем минимальный объект пользователя, который попадёт в req.user
    return { id: userId, nickname: user?.nickname ?? null };
  }
}
