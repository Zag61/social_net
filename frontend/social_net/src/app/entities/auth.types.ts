// src/app/auth/auth.types.ts
export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    email: string;
    nickname?: string;
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  nickname: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  exp: number;    // Expiration time (seconds since epoch)
  iat?: number;   // Issued at (optional)
}