import api, { ApiResponse, handleApiError } from './api';
import { LeaveRequest, LeaveType, LeaveStatus } from '@/types';

export interface LeaveFilters {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
  type?: LeaveType;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApplyLeaveData {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalance {
  paidLeave: { total: number; used: number; remaining: number };
  sickLeave: { total: number; used: number; remaining: number };
}

export const leaveService = {
  async applyLeave(data: ApplyLeaveData): Promise<LeaveRequest> {
    try {
      const response = await api.post<ApiResponse<LeaveRequest>>('/leave', data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getLeaveRequests(filters: LeaveFilters = {}): Promise<{
    requests: LeaveRequest[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await api.get<ApiResponse<LeaveRequest[]>>('/leave', { params: filters });
      return {
        requests: response.data.data,
        pagination: response.data.pagination!,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getLeaveById(id: string): Promise<LeaveRequest> {
    try {
      const response = await api.get<ApiResponse<LeaveRequest>>(`/leave/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateLeaveStatus(id: string, status: 'approved' | 'rejected', adminComment?: string): Promise<LeaveRequest> {
    try {
      const response = await api.put<ApiResponse<LeaveRequest>>(`/leave/${id}/status`, {
        status,
        adminComment,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async cancelLeave(id: string): Promise<void> {
    try {
      await api.delete(`/leave/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getLeaveBalance(): Promise<LeaveBalance> {
    try {
      const response = await api.get<ApiResponse<LeaveBalance>>('/leave/balance');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPendingCount(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>('/leave/pending-count');
      return response.data.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default leaveService;
