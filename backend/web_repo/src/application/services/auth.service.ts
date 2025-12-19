import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "src/application/dto/LoginDto";
import { UsersService } from "./users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException();
    }
     bcrypt.hash(user.passwordHash, 10, function(err, hash) {
      if (!user || !bcrypt.compare(dto.password, hash)){//user.passwordHash)) {
      throw new UnauthorizedException();
    }
    });
    

    return {
      access_token: this.jwtService.sign({ sub: user.id }),
    };
  }
}
