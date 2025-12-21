// src/application/services/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { UsersService } from "./users.service";
import { LoginDto, LoginDtoSchema } from "../dto/user.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

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
}
