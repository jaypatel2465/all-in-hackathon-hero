import api, { ApiResponse, handleApiError } from './api';
import { DashboardStats } from '@/types';

export interface AdminStats extends DashboardStats {}

export interface EmployeeStats {
  todayStatus: string;
  checkIn: string | null;
  checkOut: string | null;
  pendingLeaves: number;
  lastSalary: number | null;
}

export interface Activity {
  id: string;
  type: 'leave' | 'attendance';
  message: string;
  timestamp: string;
  status: string;
}

export interface DepartmentStats {
  department: string;
  employeeCount: number;
  presentToday: number;
}

export const dashboardService = {
  async getStats(): Promise<AdminStats | EmployeeStats> {
    try {
      const response = await api.get<ApiResponse<AdminStats | EmployeeStats>>('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getRecentActivity(limit?: number): Promise<Activity[]> {
    try {
      const response = await api.get<ApiResponse<Activity[]>>('/dashboard/activity', {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    try {
      const response = await api.get<ApiResponse<DepartmentStats[]>>('/dashboard/departments');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default dashboardService;
