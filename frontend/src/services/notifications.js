import api from './api';

export const notificationService = {
  // Получение шаблонов уведомлений
  getTemplates: () => api.get('/notifications/templates/'),
  createTemplate: (data) => api.post('/notifications/templates/', data),
  updateTemplate: (id, data) => api.put(`/notifications/templates/${id}/`, data),
  deleteTemplate: (id) => api.delete(`/notifications/templates/${id}/`),
  
  // Получение уведомлений
  getNotifications: () => api.get('/notifications/'),
  createNotification: (data) => api.post('/notifications/', data),
  sendNotification: (id) => api.post(`/notifications/${id}/send/`),
  
  // Массовая отправка
  sendBulkNotifications: (data) => api.post('/notifications/send_bulk/', data),
  
  // Получение неоплаченных участков
  getUnpaidPlots: (year) => api.get(`/plots/unpaid_plots/?year=${year || new Date().getFullYear()}`),
};