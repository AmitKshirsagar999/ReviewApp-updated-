
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly base = environment.apiBaseUrl;

  /** POST /api/Auth/Register */
  register(body: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/Auth/Register`, body);
  }

  /** POST /api/Auth/Login */
  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/Auth/Login`, body);
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  // Enhanced method to get current user from JWT token
  get currentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      
      // If no stored user, try to decode from JWT token
      const token = this.token;
      if (token) {
        try {
          const base64Payload = token.split('.')[1];
          const payload = JSON.parse(atob(base64Payload));
          
          // Extract user info from JWT claims
          const user: User = {
            id: payload.sub || payload.nameid || '',
            username: payload.unique_name || payload.username || payload.name || 'User',
            email: payload.email || ''
          };
          
          return user;
        } catch (error) {
          console.error('Error decoding JWT token:', error);
          return null;
        }
      }
    }
    return null;
  }

  // Get current username for display
  get currentUsername(): string {
    const user = this.currentUser;
    return user?.username || 'User';
  }

  get token(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }


  // Add this method to your AuthService class
getCurrentUserId(): string | null {
  const user = this.currentUser;
  return user?.id || null;
}
}

