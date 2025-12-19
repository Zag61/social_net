import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "src/application/dto/LoginDto";
import { UsersService } from "./users.service";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
}
