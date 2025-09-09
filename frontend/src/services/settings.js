// frontend/src/services/settings.js
import api from './api';

export const settingsService = {
  // Получение настроек (заглушка)
  getSettings: () => Promise.resolve({ 
    data: {
      organization_name: 'СНТ "Садовое товарищество"',
      organization_address: 'г. Москва, ул. Садовая, д. 1',
      chairman_name: 'Иванов Иван Иванович',
      chairman_phone: '+7 (999) 123-45-67',
      chairman_email: 'chairman@snt.ru',
      annual_fee: 5000,
      currency: 'RUB',
      language: 'ru',
      timezone: 'Europe/Moscow',
      notification_email: 'notifications@snt.ru',
      telegram_bot_token: '',
      smtp_host: 'smtp.yandex.ru',
      smtp_port: 465,
      smtp_username: 'notifications@snt.ru',
      smtp_password: '',
    }
  }),
  
  // Сохранение настроек (заглушка)
  saveSettings: (settings) => Promise.resolve({ data: { message: 'Настройки сохранены' } }),
  
  // Получение пользователей
  getUsers: () => api.get('/auth/users/'),
  
  // Создание пользователя
  createUser: (userData) => api.post('/auth/users/create/', userData),
  
  // Обновление пользователя
  updateUser: (userId, userData) => api.put(`/auth/users/${userId}/`, userData),
  
  // Удаление пользователя
  deleteUser: (userId) => api.delete(`/auth/users/${userId}/delete/`),
  
  // Создание приглашения
  createInvitation: (invitationData) => api.post('/auth/invitations/create/', invitationData),
};