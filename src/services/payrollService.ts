import api, { ApiResponse, handleApiError } from './api';
import { PayrollRecord } from '@/types';

export interface PayrollFilters {
  page?: number;
  limit?: number;
  userId?: string;
  month?: string;
  year?: number;
  status?: 'pending' | 'paid';
}

export interface CreatePayrollData {
  userId: string;
  month: string;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  notes?: string;
}

export interface PayrollSummary {
  totalEarned: number;
  pending: number;
  paidMonths: number;
  lastSalary: number;
}

export const payrollService = {
  async getPayrollRecords(filters: PayrollFilters = {}): Promise<{
    records: PayrollRecord[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await api.get<ApiResponse<PayrollRecord[]>>('/payroll', { params: filters });
      return {
        records: response.data.data,
        pagination: response.data.pagination!,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPayrollById(id: string): Promise<PayrollRecord> {
    try {
      const response = await api.get<ApiResponse<PayrollRecord>>(`/payroll/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async createPayroll(data: CreatePayrollData): Promise<PayrollRecord> {
    try {
      const response = await api.post<ApiResponse<PayrollRecord>>('/payroll', data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updatePayroll(id: string, data: Partial<PayrollRecord>): Promise<PayrollRecord> {
    try {
      const response = await api.put<ApiResponse<PayrollRecord>>(`/payroll/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async processPayroll(id: string): Promise<PayrollRecord> {
    try {
      const response = await api.post<ApiResponse<PayrollRecord>>(`/payroll/${id}/process`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async generateMonthlyPayroll(month: string): Promise<{ generated: number; records: PayrollRecord[] }> {
    try {
      const response = await api.post<ApiResponse<{ generated: number; records: PayrollRecord[] }>>('/payroll/generate', { month });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPayrollSummary(userId?: string): Promise<PayrollSummary> {
    try {
      const url = userId ? `/payroll/summary/${userId}` : '/payroll/summary';
      const response = await api.get<ApiResponse<PayrollSummary>>(url);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default payrollService;
