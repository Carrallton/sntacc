import api from './api';

export const paymentService = {
  getAll: () => api.get('/payments/'),
  getByYear: (year) => api.get(`/payments/by_year/?year=${year}`),
  getById: (id) => api.get(`/payments/${id}/`),
  create: (data) => api.post('/payments/', data),
  update: (id, data) => api.put(`/payments/${id}/`, data),
  delete: (id) => api.delete(`/payments/${id}/`),
  getStatistics: (year) => api.get(`/payments/statistics/?year=${year || new Date().getFullYear()}`),
};