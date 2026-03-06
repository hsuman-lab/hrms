import api from './api';
import { ApiResponse, User } from '@/types';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    return res.data.data!;
  },
  me: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put<ApiResponse>('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};
