import api from './api';

export const auditService = {
  // Получение всех записей аудита
  getAuditLogs: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/audit/?${queryParams}`);
  },
  
  // Получение последних записей
  getRecentLogs: (limit = 50) => api.get(`/audit/recent/?limit=${limit}`),
  
  // Получение логов пользователя
  getUserLogs: (userId, limit = 50) => api.get(`/audit/user_logs/?user_id=${userId}&limit=${limit}`),
  
  // Получение статистики
  getStatistics: () => api.get('/audit/statistics/'),
  
  // Фильтрация логов
  filterLogs: (filters) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/audit/?${params.toString()}`);
  }
};