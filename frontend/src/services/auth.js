import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      // Сохраняем токены в localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  register: (userData) => api.post('/auth/register/', userData),
  
  getCurrentUser: () => api.get('/auth/me/'),
  
  updateProfile: (userData) => api.put('/auth/me/update/', userData),
  
  changePassword: (passwordData) => api.put('/auth/me/change-password/', passwordData),
  
  refreshToken: () => {
    const refresh = localStorage.getItem('refresh_token');
    return api.post('/auth/login/refresh/', { refresh });
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
  
  getToken: () => {
    return localStorage.getItem('access_token');
  }
};