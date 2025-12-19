import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from 'src/application/dto/LoginDto';
import { AuthService } from 'src/application/services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
