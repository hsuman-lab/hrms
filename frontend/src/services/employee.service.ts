import api from './api';
import { ApiResponse, Employee } from '@/types';

export const employeeService = {
  getAll: async (page = 1, limit = 20) => {
    const res = await api.get<ApiResponse<{ employees: Employee[]; total: number }>>(`/employees?page=${page}&limit=${limit}`);
    return res.data.data!;
  },
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return res.data.data!;
  },
  getMyProfile: async () => {
    const res = await api.get<ApiResponse<Employee>>('/employees/me');
    return res.data.data!;
  },
  getDashboard: async () => {
    const res = await api.get<ApiResponse>('/employees/dashboard');
    return res.data.data;
  },
  getTeam: async () => {
    const res = await api.get<ApiResponse<Employee[]>>('/employees/team');
    return res.data.data!;
  },
  create: async (data: Record<string, unknown>) => {
    const res = await api.post<ApiResponse<Employee>>('/employees', data);
    return res.data.data!;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put<ApiResponse<Employee>>(`/employees/${id}`, data);
    return res.data.data!;
  },
  isManager: async (): Promise<{ isManager: boolean; subordinateCount: number }> => {
    const res = await api.get<ApiResponse<{ isManager: boolean; subordinateCount: number }>>('/employees/is-manager');
    return res.data.data ?? { isManager: false, subordinateCount: 0 };
  },
};
