import api from './api';

export const reportService = {
  // Получение данных для отчета по платежам
  getPaymentReport: (year, format = 'json') => 
    api.get(`/payments/by_year/?year=${year}`, {
      headers: {
        'Accept': format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/json'
      },
      responseType: format === 'excel' ? 'blob' : 'json'
    }),
  
  // Получение статистики по платежам
  getPaymentStatistics: (year) => 
    api.get(`/payments/statistics/?year=${year}`),
  
  // Экспорт данных об участках
  exportPlots: (format = 'csv') => 
    api.get(`/plots/export/?format=${format}`, {
      responseType: 'blob'
    }),
  
  // Экспорт данных о владельцах
  exportOwners: (format = 'csv') => 
    api.get(`/owners/export/?format=${format}`, {
      responseType: 'blob'
    }),
};