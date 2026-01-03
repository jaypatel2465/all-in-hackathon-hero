import api, { ApiResponse, setTokens, clearTokens, handleApiError } from './api';
import { User, UserRole } from '@/types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
        email,
        password,
      });
      
      const { user, accessToken, refreshToken } = response.data.data;
      setTokens(accessToken, refreshToken);
      localStorage.setItem('dayflow_user', JSON.stringify(user));
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async signup(data: SignupData): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/signup', data);
      
      const { user, accessToken, refreshToken } = response.data.data;
      setTokens(accessToken, refreshToken);
      localStorage.setItem('dayflow_user', JSON.stringify(user));
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('dayflow_refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('dayflow_access_token');
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem('dayflow_user');
    return stored ? JSON.parse(stored) : null;
  },
};

export default authService;
