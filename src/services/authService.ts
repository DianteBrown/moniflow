import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  created_at?: string;
  profile_completed?: boolean;
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
  phone_number: string;
}
export interface ProfileCompletionData {
  password: string;
  phone_number: string;
}

export interface UpdateProfileData {
  name: string;
  phone_number: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
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

  async googleAuth(credential: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', { token: credential });
    this.setToken(response.data.token);
    return response.data;
  }
  async completeGoogleProfile(data: ProfileCompletionData): Promise<{ message: string; user: User }> {
    const response = await api.post<{ message: string; user: User }>('/auth/complete-google-profile', data);
    return response.data;
  }
  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: User }> {
    const response = await api.put<{ message: string; user: User }>('/auth/profile', data);
    return response.data;
  }
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
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