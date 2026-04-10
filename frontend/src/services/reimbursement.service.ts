import api from './api';
import { ApiResponse, Reimbursement } from '@/types';

export const reimbursementService = {
  apply: async (data: {
    category: string;
    amount: number;
    description: string;
    billDate: string;
  }) => {
    const res = await api.post<ApiResponse<Reimbursement>>('/reimbursements', data);
    return res.data.data!;
  },

  getMine: async () => {
    const res = await api.get<ApiResponse<Reimbursement[]>>('/reimbursements/my');
    return res.data.data!;
  },

  getPendingTeam: async () => {
    const res = await api.get<ApiResponse<Reimbursement[]>>('/reimbursements/pending-team');
    return res.data.data!;
  },

  action: async (id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) => {
    const res = await api.patch<ApiResponse>(`/reimbursements/${id}/action`, { status, remarks });
    return res.data;
  },

  getAllHR: async (status?: string) => {
    const res = await api.get<ApiResponse<Reimbursement[]>>('/reimbursements', { params: status ? { status } : {} });
    return res.data.data!;
  },
};
