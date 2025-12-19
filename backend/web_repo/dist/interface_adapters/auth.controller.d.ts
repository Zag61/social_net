import { AuthService } from './auth.service';
import { LoginDto } from 'src/application/dto/LoginDto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
}
