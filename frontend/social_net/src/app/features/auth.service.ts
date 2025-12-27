// src/app/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { AuthResponse, LoginDto, RegisterDto } from '../entities/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  
  private api = 'http://localhost:3000';

  // Typed login method
  async login(dto: LoginDto): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.api}/auth/login`, dto, {
          withCredentials: true,
        })
      );
      
      // Store the token
      this.tokenService.setToken(response.access_token);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Typed register method
  async register(dto: RegisterDto): Promise<AuthResponse> {
    console.log('Registering user:', dto);
    
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.api}/auth/register`, dto)
      );
      
      // Store the token
      this.tokenService.setToken(response.access_token);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Start Google OAuth
  startGoogleAuth(): void {
    window.location.href = `${this.api}/auth/google`;
  }

  // Check authentication status with server
  async checkAuth(): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.api}/auth/check-token`, {}, {
        withCredentials: true,
      })
    );
    
    // Update token if server returns a new one
    if (response.access_token) {
      this.tokenService.setToken(response.access_token);
    }
    
    return response;
  }

  // Check session (returns observable for subscription)
  checkSession() {
    return this.http.post<AuthResponse>(`${this.api}/auth/check-token`, {}, {
      withCredentials: true,
    });
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.api}/auth/logout`, {}, {
          withCredentials: true,
        })
      );
    } finally {
      // Always clear local auth state
      this.tokenService.clear();
      this.router.navigate(['/login']);
    }
  }

  // Convenience getters
  get currentUser() {
    return this.tokenService.currentUser;
  }

  get isAuthenticated() {
    return this.tokenService.isAuthenticated;
  }

  getToken(): string | null {
    return this.tokenService.token;
  }
}