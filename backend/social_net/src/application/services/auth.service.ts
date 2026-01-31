import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { UsersService } from "./users.service";
import { LoginDto, LoginDtoSchema } from "../dto/user.dto";
import { User } from "src/domain/entities/user";
import { randomBytes } from "crypto";
import nodemailer from 'nodemailer';
import { USER_REPOSITORY, type UserRepository } from "src/domain/repositories/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY)
        private readonly usersRepo: UserRepository,
  ) { }

  async login(dto: LoginDto) {
    // 1️⃣ Валидируем входные данные
    const validated = LoginDtoSchema.parse(dto);
    // 2️⃣ Находим пользователя по email
    const user = await this.usersService.findByEmail(validated.email);
    if (!user || !user.verified) {
      throw new UnauthorizedException('Email not verified or invalid credentials');
    }
    // 3️⃣ Сравниваем пароль с хэшем
    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials, wrong password');
    }
    // 4️⃣ Возвращаем JWT
    return {
      access_token: this.jwtService.sign({ id: user.id }),
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

  async sendVerificationEmail(user: User) {
  const token = await this.usersRepo.createVerificationTokenForUser(user.id);
  const link = `${process.env.BACKEND_URL}/auth/verify/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

  // send email (same as you did). No token stored on User.
  await transporter.sendMail({
    from: `"MyApp" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Click <a href="${link}">here</a> to verify your account</p>`,
  });
}


  async verifyEmail(token: string): Promise<User | null> {
    const user = await this.usersService.verifyByToken(token);
    if (!user) return null;

    return user;
  }
}
