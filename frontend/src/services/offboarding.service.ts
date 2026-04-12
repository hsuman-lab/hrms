import api from './api';

export const offboardingService = {
  getMyResignation:           () => api.get('/offboarding/resignation').then(r => r.data.data),
  submitResignation:          (data: object) => api.post('/offboarding/resignation', data).then(r => r.data.data),
  withdrawResignation:        () => api.patch('/offboarding/resignation/withdraw').then(r => r.data.data),
  getPendingResignations:     () => api.get('/offboarding/resignation/pending').then(r => r.data.data),
  actionResignation:          (id: string, data: object) => api.patch(`/offboarding/resignation/approvals/${id}`, data).then(r => r.data.data),
  getExitInterview:           () => api.get('/offboarding/exit-interview').then(r => r.data.data),
  submitExitInterview:        (data: object) => api.put('/offboarding/exit-interview', data).then(r => r.data.data),
  getFnFSettlement:           () => api.get('/offboarding/fnf').then(r => r.data.data),
  upsertFnFSettlement:        (data: object) => api.put('/offboarding/fnf', data).then(r => r.data.data),
  getMyOffboardingChecklist:  () => api.get('/offboarding/checklist').then(r => r.data.data),
  updateOffboardingItem:      (id: string, data: object) => api.patch(`/offboarding/checklist/${id}`, data).then(r => r.data.data),
  bootstrapOffboardingChecklist: (employeeId: string) => api.post(`/offboarding/bootstrap/${employeeId}`).then(r => r.data.data),
};
