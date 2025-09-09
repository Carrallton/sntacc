import api from './api';

export const plotService = {
  getAll: async () => {
    console.log('Запрос к API: /api/plots/');
    try {
      const response = await api.get('/plots/');
      console.log('Ответ от API:', response.data);
      return response;
    } catch (error) {
      console.error('Ошибка при запросе участков:', error);
      throw error;
    }
  },
  getById: (id) => api.get(`/plots/${id}/`),
  create: (data) => api.post('/plots/', data),
  update: (id, data) => api.put(`/plots/${id}/`, data),
  delete: (id) => api.delete(`/plots/${id}/`),
  addOwner: (plotId, data) => api.post(`/plots/${plotId}/add_owner/`, data),
  getUnpaid: (year) => api.get(`/plots/unpaid_plots/?year=${year || new Date().getFullYear()}`),
};