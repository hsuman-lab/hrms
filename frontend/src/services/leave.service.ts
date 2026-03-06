import api from './api';
import { ApiResponse, LeaveBalance, LeaveRequest, LeaveType } from '@/types';

export const leaveService = {
  getTypes: async () => {
    const res = await api.get<ApiResponse<LeaveType[]>>('/leave/types');
    return res.data.data!;
  },
  createType: async (data: Record<string, unknown>) => {
    const res = await api.post<ApiResponse<LeaveType>>('/leave/types', data);
    return res.data.data!;
  },
  updateType: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put<ApiResponse<LeaveType>>(`/leave/types/${id}`, data);
    return res.data.data!;
  },
  apply: async (data: { leaveTypeId: string; startDate: string; endDate: string; reason?: string }) => {
    const res = await api.post<ApiResponse<LeaveRequest>>('/leave/apply', data);
    return res.data.data!;
  },
  getMyLeaves: async (status?: string) => {
    const res = await api.get<ApiResponse<LeaveRequest[]>>('/leave/my', { params: { status } });
    return res.data.data!;
  },
  getBalance: async () => {
    const res = await api.get<ApiResponse<LeaveBalance[]>>('/leave/balance');
    return res.data.data!;
  },
  getPendingApprovals: async () => {
    const res = await api.get<ApiResponse<LeaveRequest[]>>('/leave/pending');
    return res.data.data!;
  },
  approve: async (id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) => {
    const res = await api.post<ApiResponse>(`/leave/${id}/approve`, { status, remarks });
    return res.data;
  },
  getAllLeaves: async (params?: { status?: string; month?: number; year?: number }) => {
    const res = await api.get<ApiResponse<LeaveRequest[]>>('/leave/all', { params });
    return res.data.data!;
  },
};
