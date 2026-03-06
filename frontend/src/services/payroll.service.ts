import api from './api';
import { ApiResponse, PayrollRecord } from '@/types';

export const payrollService = {
  getMonthly: async (month: number, year: number) => {
    const res = await api.get<ApiResponse<PayrollRecord[]>>('/payroll/monthly', { params: { month, year } });
    return res.data.data!;
  },
  getMyPayroll: async () => {
    const res = await api.get<ApiResponse<PayrollRecord[]>>('/payroll/my');
    return res.data.data!;
  },
  getSummary: async (year: number) => {
    const res = await api.get<ApiResponse>('/payroll/summary', { params: { year } });
    return res.data.data;
  },
  generate: async (month: number, year: number) => {
    const res = await api.post<ApiResponse>('/payroll/generate', { month, year });
    return res.data;
  },
  exportCSV: async (month: number, year: number) => {
    const res = await api.get('/payroll/export', {
      params: { month, year },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payroll-${year}-${String(month).padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
