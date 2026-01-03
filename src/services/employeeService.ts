import api, { ApiResponse, handleApiError } from './api';
import { User } from '@/types';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export const employeeService = {
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/users/profile');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', data);
      // Update stored user
      localStorage.setItem('dayflow_user', JSON.stringify(response.data.data));
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getAllEmployees(filters: EmployeeFilters = {}): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/employees', { params: filters });
      return {
        data: response.data.data,
        pagination: response.data.pagination!,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getEmployeeById(id: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/employees/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateEmployee(id: string, data: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(`/employees/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getDepartments(): Promise<{ department: string; employee_count: number }[]> {
    try {
      const response = await api.get<ApiResponse<{ department: string; employee_count: number }[]>>('/employees/departments');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default employeeService;
