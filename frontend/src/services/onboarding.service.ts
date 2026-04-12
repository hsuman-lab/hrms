import api from './api';

export const onboardingService = {
  getMasterTasks:         () => api.get('/onboarding/tasks').then(r => r.data.data),
  createMasterTask:       (data: object) => api.post('/onboarding/tasks', data).then(r => r.data.data),
  getMyChecklist:         () => api.get('/onboarding/checklist').then(r => r.data.data),
  updateChecklistItem:    (id: string, data: object) => api.patch(`/onboarding/checklist/${id}`, data).then(r => r.data.data),
  bootstrapChecklist:     (employeeId: string) => api.post(`/onboarding/bootstrap/${employeeId}`).then(r => r.data.data),
  getPolicies:            () => api.get('/onboarding/policies').then(r => r.data.data),
  acknowledgePolicy:      (data: object) => api.post('/onboarding/policies/acknowledge', data).then(r => r.data.data),
  getExperience:          () => api.get('/onboarding/experience').then(r => r.data.data),
  submitExperience:       (data: object) => api.put('/onboarding/experience', data).then(r => r.data.data),
};
