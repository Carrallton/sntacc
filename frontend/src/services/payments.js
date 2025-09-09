import api from './api';

export const paymentService = {
  getAll: () => api.get('/payments/'),
  getByYear: (year) => api.get(`/payments/by_year/?year=${year}`),
  getById: (id) => api.get(`/payments/${id}/`),
  create: async (data) => {
    console.log('Создание платежа с данными:', data);
    try {
      const response = await api.post('/payments/', data);
      console.log('Ответ от сервера:', response.data);
      return response;
    } catch (error) {
      console.error('Ошибка при создании платежа:', error.response?.data);
      throw error;
    }
  },
  update: async (id, data) => {
    console.log('Обновление платежа с данными:', data);
    try {
      const response = await api.put(`/payments/${id}/`, data);
      console.log('Ответ от сервера:', response.data);
      return response;
    } catch (error) {
      console.error('Ошибка при обновлении платежа:', error.response?.data);
      throw error;
    }
  },
  delete: (id) => api.delete(`/payments/${id}/`),
  getStatistics: (year) => api.get(`/payments/statistics/?year=${year || new Date().getFullYear()}`),
};