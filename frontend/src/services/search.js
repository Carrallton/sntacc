import api from './api';

export const searchService = {
  // Поиск участков
  searchPlots: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/plots/search/?${queryParams}`);
  },
  
  // Поиск собственников
  searchOwners: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/owners/search/?${queryParams}`);
  },
  
  // Поиск платежей
  searchPayments: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/payments/search/?${queryParams}`);
  },
  
  // Универсальный поиск
  searchAll: async (query) => {
    try {
      const [plots, owners, payments] = await Promise.all([
        api.get(`/plots/?search=${encodeURIComponent(query)}`),
        api.get(`/owners/?search=${encodeURIComponent(query)}`),
        api.get(`/payments/?search=${encodeURIComponent(query)}`)
      ]);
      
      return {
        plots: plots.data,
        owners: owners.data,
        payments: payments.data
      };
    } catch (error) {
      throw error;
    }
  }
};