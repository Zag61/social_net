// src/interfaces/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from 'src/application/services/auth.service';
import { CreateUserDtoSchema, LoginDtoSchema } from 'src/application/dto/user.dto';
import type { CreateUserDto, LoginDto } from 'src/application/dto/user.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UsersService } from 'src/application/services/users.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  async register(@Body(new ZodValidationPipe(CreateUserDtoSchema)) dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return { id: user.id, nickname: user.nickname, email: dto.email };
  }

  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginDtoSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-token')
  checkToken(@Request() req: any) {
    return { ok: true, user: req.user };
  }
}
