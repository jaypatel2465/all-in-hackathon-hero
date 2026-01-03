import api, { ApiResponse, handleApiError } from './api';
import { AttendanceRecord, AttendanceStatus } from '@/types';

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: AttendanceStatus;
}

export interface WeeklySummary {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  halfDays: number;
  totalHours: number;
}

export const attendanceService = {
  async checkIn(notes?: string): Promise<AttendanceRecord> {
    try {
      const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', { notes });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async checkOut(notes?: string): Promise<AttendanceRecord> {
    try {
      const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-out', { notes });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getTodayAttendance(): Promise<AttendanceRecord | null> {
    try {
      const response = await api.get<ApiResponse<AttendanceRecord | null>>('/attendance/today');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getHistory(filters: AttendanceFilters = {}): Promise<{
    records: AttendanceRecord[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance/history', { params: filters });
      return {
        records: response.data.data,
        pagination: response.data.pagination!,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getWeeklySummary(userId?: string): Promise<WeeklySummary> {
    try {
      const url = userId ? `/attendance/weekly-summary/${userId}` : '/attendance/weekly-summary';
      const response = await api.get<ApiResponse<WeeklySummary>>(url);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    try {
      const response = await api.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default attendanceService;
