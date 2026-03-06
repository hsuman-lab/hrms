import api from './api';
import { ApiResponse, Department, Role } from '@/types';

export const hrService = {
  getDepartments: async () => {
    const res = await api.get<ApiResponse<Department[]>>('/hr/departments');
    return res.data.data!;
  },
  createDepartment: async (name: string, description?: string) => {
    const res = await api.post<ApiResponse<Department>>('/hr/departments', { name, description });
    return res.data.data!;
  },
  updateDepartment: async (id: string, name: string, description?: string) => {
    const res = await api.put<ApiResponse<Department>>(`/hr/departments/${id}`, { name, description });
    return res.data.data!;
  },
  deleteDepartment: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/hr/departments/${id}`);
    return res.data;
  },
  getRoles: async () => {
    const res = await api.get<ApiResponse<Role[]>>('/hr/roles');
    return res.data.data!;
  },
  getAnalytics: async () => {
    const res = await api.get<ApiResponse>('/hr/analytics');
    return res.data.data;
  },
  updateUserRole: async (userId: string, roleId: string) => {
    const res = await api.put<ApiResponse>(`/hr/users/${userId}/role`, { roleId });
    return res.data;
  },
  toggleUserStatus: async (userId: string) => {
    const res = await api.put<ApiResponse>(`/hr/users/${userId}/toggle-status`);
    return res.data;
  },
  getAuditLogs: async (page = 1, limit = 50) => {
    const res = await api.get<ApiResponse>('/hr/audit-logs', { params: { page, limit } });
    return res.data.data;
  },
};
