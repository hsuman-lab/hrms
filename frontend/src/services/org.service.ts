import api from './api';

export const orgService = {
  getOrgChart:              () => api.get('/org/chart').then(r => r.data.data),
  getTeamDirectory:         (params?: object) => api.get('/org/directory', { params }).then(r => r.data.data),
  getJobPostings:           (status?: string) => api.get('/org/jobs', { params: { status } }).then(r => r.data.data),
  getJobPostingById:        (id: string) => api.get(`/org/jobs/${id}`).then(r => r.data.data),
  createJobPosting:         (data: object) => api.post('/org/jobs', data).then(r => r.data.data),
  updateJobPosting:         (id: string, data: object) => api.patch(`/org/jobs/${id}`, data).then(r => r.data.data),
  applyToJob:               (id: string, coverNote?: string) => api.post(`/org/jobs/${id}/apply`, { coverNote }).then(r => r.data.data),
  getMyApplications:        () => api.get('/org/my-applications').then(r => r.data.data),
  getApplicationsForPosting:(id: string) => api.get(`/org/jobs/${id}/applications`).then(r => r.data.data),
  updateApplicationStatus:  (id: string, status: string) => api.patch(`/org/applications/${id}`, { status }).then(r => r.data.data),
};
