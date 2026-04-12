import api from './api';
import { ApiResponse, Course, CourseEnrollment, LearningStats, Certificate } from '@/types';

export const learningService = {
  // Employee
  getMyEnrollments: async () => {
    const res = await api.get<ApiResponse<CourseEnrollment[]>>('/learning/my');
    return res.data.data!;
  },
  updateProgress: async (courseId: string, progress_pct: number) => {
    const res = await api.patch<ApiResponse<CourseEnrollment>>(`/learning/my/${courseId}/progress`, { progress_pct });
    return res.data.data!;
  },

  // All authenticated — course catalogue
  getCourses: async () => {
    const res = await api.get<ApiResponse<Course[]>>('/learning/courses');
    return res.data.data!;
  },

  // HR
  createCourse: async (data: {
    title: string;
    description?: string;
    category?: string;
    is_mandatory?: boolean;
    duration_mins?: number;
  }) => {
    const res = await api.post<ApiResponse<Course>>('/learning/courses', data);
    return res.data.data!;
  },
  updateCourse: async (id: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    is_mandatory: boolean;
    duration_mins: number;
  }>) => {
    const res = await api.put<ApiResponse<Course>>(`/learning/courses/${id}`, data);
    return res.data.data!;
  },
  deleteCourse: async (id: string) => {
    await api.delete(`/learning/courses/${id}`);
  },
  enrollAll: async (courseId: string, due_date?: string) => {
    const res = await api.post<ApiResponse>(`/learning/courses/${courseId}/enroll`, { due_date });
    return res.data;
  },
  enrollEmployees: async (courseId: string, employee_ids: string[], due_date?: string) => {
    const res = await api.post<ApiResponse>(`/learning/courses/${courseId}/enroll`, { employee_ids, due_date });
    return res.data;
  },
  getCourseEnrollments: async (courseId: string) => {
    const res = await api.get<ApiResponse<CourseEnrollment[]>>(`/learning/courses/${courseId}/enrollments`);
    return res.data.data!;
  },
  getStats: async () => {
    const res = await api.get<ApiResponse<LearningStats>>('/learning/stats');
    return res.data.data!;
  },

  // Certificates
  getMyCertificates: async () => {
    const res = await api.get<ApiResponse<Certificate[]>>('/learning/certificates');
    return res.data.data!;
  },
  addCertificate: async (data: object) => {
    const res = await api.post<ApiResponse<Certificate>>('/learning/certificates', data);
    return res.data.data!;
  },
  updateCertificate: async (id: string, data: object) => {
    const res = await api.patch<ApiResponse<Certificate>>(`/learning/certificates/${id}`, data);
    return res.data.data!;
  },
  deleteCertificate: async (id: string) => {
    await api.delete(`/learning/certificates/${id}`);
  },
};
