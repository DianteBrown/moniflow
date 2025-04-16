import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    this.setToken(response.data.token);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/password-reset/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/password-reset/reset-password/${token}`, { password });
    return response.data;
  }

  async verifyResetToken(token: string): Promise<{ message: string }> {
    const response = await api.get<{ message: string }>(`/password-reset/verify-token/${token}`);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService(); 