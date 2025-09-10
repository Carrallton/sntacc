import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      
      if (response.data.two_factor_required) {
        // Требуется 2FA
        return {
          two_factor_required: true,
          user_id: response.data.user_id
        };
      }
      
      if (response.data.change_password_required) {
        // Требуется смена пароля
        return {
          change_password_required: true,
          user: response.data.user,
          warning: response.data.warning
        };
      }
      
      // Обычная аутентификация
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  verify2FA: async (userId, token) => {
    try {
      const response = await api.post('/auth/verify-2fa/', {
        user_id: userId,
        token: token
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  enable2FA: async () => {
    try {
      const response = await api.post('/auth/2fa/enable/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  verifyAndEnable2FA: async (token) => {
    try {
      const response = await api.post('/auth/2fa/verify-enable/', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  disable2FA: async () => {
    try {
      const response = await api.post('/auth/2fa/disable/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getSecuritySettings: async () => {
    try {
      const response = await api.get('/auth/security-settings/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password/', passwordData);
      return response.data;
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