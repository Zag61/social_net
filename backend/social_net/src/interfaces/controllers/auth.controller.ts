import { Controller, Post, Body, UseGuards, Request, Get, Req } from '@nestjs/common';
import { AuthService } from 'src/application/services/auth.service';
import { CreateUserDtoSchema, LoginDtoSchema } from 'src/application/dto/user.dto';
import type { CreateUserDto, LoginDto } from 'src/application/dto/user.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { UsersService } from 'src/application/services/users.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will never return, Passport handles redirect to Google
  }

  // 2️⃣ Callback route after Google login
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any) {
    // req.user will contain the validated user
    // You can return JWT or redirect to frontend
    const user = req.user;
    const token = await this.authService.generateJwt(user); // implement this
    return { access_token: token, user };
  }
}
