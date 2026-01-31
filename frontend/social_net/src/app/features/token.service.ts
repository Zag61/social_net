// src/app/auth/token.service.ts
import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtPayload } from '../entities/auth.types';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';
  
  currentUser = signal<string | null>(null);
  isAuthenticated = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    // Only initialize from storage if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFromStorage();
    }
  }

  get token(): string | null {
    // Check if we're in browser before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string): void {
    // Only save to localStorage if in browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(this.extractUserFromToken(token)));
    }
    
    // Always update signals (they work on server too)
    const user = this.extractUserFromToken(token);
    if (user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  // Extract user from token
  private extractUserFromToken(token: string): string | null {
    try {
      console.log(token)
      const payload = this.decodeToken(token);
      
      if (!payload) return null;
      return payload.id!;
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  // Decode token
  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as JwtPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is valid
  isValid(): boolean {
    // On server, always return false (no localStorage)
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = this.token;
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      const expiryTime = payload.exp * 1000;
      return Date.now() < expiryTime;
    } catch {
      return false;
    }
  }

  clear(): void {
    // Clear from localStorage if in browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    
    // Always clear signals
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private initializeFromStorage(): void {
    // Only runs in browser
    const token = this.token;
    if (token && this.isValid()) {
      const user = this.extractUserFromToken(token);
      if (user) {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }
    }
  }
}