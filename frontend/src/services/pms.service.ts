import api from './api';

export const pmsService = {
  getMyGoals:               (period?: string) => api.get('/pms/goals', { params: { period } }).then(r => r.data.data),
  getTeamGoals:             (period?: string) => api.get('/pms/team/goals', { params: { period } }).then(r => r.data.data),
  createGoal:               (data: object) => api.post('/pms/goals', data).then(r => r.data.data),
  updateGoal:               (id: string, data: object) => api.patch(`/pms/goals/${id}`, data).then(r => r.data.data),
  getMySelfAssessments:     () => api.get('/pms/assessments').then(r => r.data.data),
  upsertSelfAssessment:     (data: object) => api.put('/pms/assessments', data).then(r => r.data.data),
  getPendingReviews:        () => api.get('/pms/reviews/pending').then(r => r.data.data),
  submitManagerReview:      (id: string, data: object) => api.put(`/pms/reviews/${id}`, data).then(r => r.data.data),
  getFeedbackReceived:      () => api.get('/pms/feedback').then(r => r.data.data),
  submitFeedback:           (data: object) => api.post('/pms/feedback', data).then(r => r.data.data),
  getSkills:                () => api.get('/pms/skills').then(r => r.data.data),
  addSkill:                 (data: object) => api.post('/pms/skills', data).then(r => r.data.data),
  deleteSkill:              (id: string) => api.delete(`/pms/skills/${id}`).then(r => r.data),
  getSkillPlans:            () => api.get('/pms/skill-plans').then(r => r.data.data),
  createSkillPlan:          (data: object) => api.post('/pms/skill-plans', data).then(r => r.data.data),
  updateSkillPlan:          (id: string, data: object) => api.patch(`/pms/skill-plans/${id}`, data).then(r => r.data.data),
};
