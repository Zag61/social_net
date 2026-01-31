import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
  Res,
  NotFoundException,
  Param,
  BadRequestException,
} from '@nestjs/common';

import type { Response } from 'express'; // ✅ THIS IS THE KEY
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from 'src/application/services/auth.service';
import { UsersService } from 'src/application/services/users.service';
import { JwtAuthGuard } from '../guards/auth.guard';

import {
  CreateUserDtoSchema,
  LoginDtoSchema,
} from 'src/application/dto/user.dto';

import type {
  CreateUserDto,
  LoginDto,
} from 'src/application/dto/user.dto';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // ---------------- REGISTER ----------------

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(CreateUserDtoSchema)) dto: CreateUserDto,
  ) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      if (!existingUser.verified) {
        await this.authService.sendVerificationEmail(existingUser);
        return {
          message:
            'Email already registered but not verified. Verification email resent.',
        };
      }
      throw new BadRequestException('Email already in use');
    }
    const user = await this.usersService.createUser(dto);
    await this.authService.sendVerificationEmail(user);

    return {
      id: user.id,
      nickname: user.nickname,
      email: dto.email,
      message: 'Check your email to verify your account',
    };
  }

  // ---------------- VERIFY EMAIL ----------------

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    const user = await this.usersService.verifyByToken(token);
    if (!user) throw new NotFoundException('Invalid verification token');

    return { message: 'Email verified. You can now log in' };
  }

  // ---------------- LOGIN ----------------

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  // ---------------- CHECK TOKEN ----------------

  @UseGuards(JwtAuthGuard)
  @Post('check-token')
  checkToken(@Request() req: any) {
    return { ok: true, user: req.user };
  }

  // ---------------- GOOGLE OAUTH ----------------

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirects automatically
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response, // ✅ EXPRESS RESPONSE
  ) {
    console.log('Google callback hit, query:', req.query);
    const user = req.user;
    const jwt = this.authService.generateJwt(user);

    res.cookie('access_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect(
      process.env.FRONTEND_URL ?? 'http://localhost:4200',
    );
  }
}