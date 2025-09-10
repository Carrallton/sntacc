import api from './api';

export const reportService = {
  // Получение шаблонов отчетов
  getTemplates: () => api.get('/reports/templates/'),
  createTemplate: (data) => api.post('/reports/templates/', data),
  updateTemplate: (id, data) => api.put(`/reports/templates/${id}/`, data),
  deleteTemplate: (id) => api.delete(`/reports/templates/${id}/`),
  
  // Получение сгенерированных отчетов
  getReports: () => api.get('/reports/'),
  generateReport: (data) => api.post('/reports/generate/', data),
  downloadReport: async (id) => {
    try {
      const response = await api.get(`/reports/${id}/download/`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  deleteReport: (id) => api.delete(`/reports/${id}/`),
  
  // Специализированные отчеты
  getPaymentSummary: (year) => api.get(`/reports/payment_summary/?year=${year || new Date().getFullYear()}`),
  getDebtReport: (year) => api.get(`/reports/debt_report/?year=${year || new Date().getFullYear()}`),
  getFinancialReport: () => api.get('/reports/financial_report/'),
};