import api from './api';

export const ownerService = {
  getAll: () => api.get('/owners/'),
  getById: (id) => api.get(`/owners/${id}/`),
  create: (data) => api.post('/owners/', data),
  update: (id, data) => api.put(`/owners/${id}/`, data),
  delete: (id) => api.delete(`/owners/${id}/`),
};