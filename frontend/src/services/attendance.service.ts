import api from './api';
import { ApiResponse, Attendance } from '@/types';

export const attendanceService = {
  clockIn: async () => {
    const res = await api.post<ApiResponse<Attendance>>('/attendance/clock-in');
    return res.data.data!;
  },
  clockOut: async () => {
    const res = await api.post<ApiResponse<Attendance>>('/attendance/clock-out');
    return res.data.data!;
  },
  getToday: async () => {
    const res = await api.get<ApiResponse<Attendance | null>>('/attendance/today');
    return res.data.data ?? null;
  },
  getHistory: async (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ records: Attendance[]; total: number }>>('/attendance/history', { params });
    return res.data.data!;
  },
  getTeamAttendance: async (date?: string) => {
    const res = await api.get<ApiResponse>('/attendance/team', { params: { date } });
    return res.data.data;
  },
  getMonthlyReport: async (year: number, month: number) => {
    const res = await api.get<ApiResponse>('/attendance/report', { params: { year, month } });
    return res.data.data;
  },
};
