import api from './api';

export const essService = {
  getAddresses:             () => api.get('/ess/addresses').then(r => r.data.data),
  upsertAddress:            (data: object) => api.put('/ess/addresses', data).then(r => r.data.data),
  getBankDetail:            () => api.get('/ess/bank').then(r => r.data.data),
  upsertBankDetail:         (data: object) => api.put('/ess/bank', data).then(r => r.data.data),
  getEmergencyContacts:     () => api.get('/ess/emergency-contacts').then(r => r.data.data),
  addEmergencyContact:      (data: object) => api.post('/ess/emergency-contacts', data).then(r => r.data.data),
  updateEmergencyContact:   (id: string, data: object) => api.put(`/ess/emergency-contacts/${id}`, data).then(r => r.data.data),
  deleteEmergencyContact:   (id: string) => api.delete(`/ess/emergency-contacts/${id}`).then(r => r.data),
  getDocuments:             () => api.get('/ess/documents').then(r => r.data.data),
  addDocument:              (data: object) => api.post('/ess/documents', data).then(r => r.data.data),
  deleteDocument:           (id: string) => api.delete(`/ess/documents/${id}`).then(r => r.data),
};
