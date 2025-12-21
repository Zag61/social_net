// src/application/services/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { UsersService } from "./users.service";
import { LoginDto, LoginDtoSchema } from "../dto/user.dto";
import { User } from "src/domain/entities/user";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) { }

  async login(dto: LoginDto) {
    // 1️⃣ Валидируем входные данные
    const validated = LoginDtoSchema.parse(dto);

    // 2️⃣ Находим пользователя по email
    const user = await this.usersService.findByEmail(validated.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials, email not found');
    }
    console.log('LOGIN DEBUG', {
      email: validated.email,
      password: validated.password,
      hash: user
    });

    // 3️⃣ Сравниваем пароль с хэшем
    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials, wrong password');
    }

    // 4️⃣ Возвращаем JWT
    return {
      access_token: this.jwtService.sign({ sub: user.id }),
    };
  }
  async validateOAuthLogin(oauthData: { email: string; firstName?: string; lastName?: string; accessToken: string }) {
    let user = await this.usersService.findByEmail(oauthData.email);
    if (!user) {
      // create new user with minimal info
      user = await this.usersService.createUser({
        email: oauthData.email,
        nickname: oauthData.firstName ?? 'User',
        password: crypto.randomUUID(), // dummy password, not used
      });
    }
    return user;
  }
  generateJwt(user: User) {
    // Standard JWT payload: you can add more info if needed
    const payload = { sub: user.id, nickname: user.nickname };
    return this.jwtService.sign(payload);
  }
}
