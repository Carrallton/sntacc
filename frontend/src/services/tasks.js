import api from './api';

export const taskService = {
  // Получение задач
  getTasks: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/tasks/tasks/?${queryParams}`);
  },
  
  // Создание задачи
  createTask: (data) => api.post('/tasks/tasks/', data),
  
  // Обновление задачи
  updateTask: (id, data) => api.put(`/tasks/tasks/${id}/`, data),
  
  // Удаление задачи
  deleteTask: (id) => api.delete(`/tasks/tasks/${id}/`),
  
  // Завершение задачи
  completeTask: (id) => api.post(`/tasks/tasks/${id}/complete/`),
  
  // Назначение задачи
  assignTask: (id, userId) => api.post(`/tasks/tasks/${id}/assign/`, { user_id: userId }),
  
  // Мои задачи
  getMyTasks: () => api.get('/tasks/tasks/my_tasks/'),
  
  // Просроченные задачи
  getOverdueTasks: () => api.get('/tasks/tasks/overdue/'),
  
  // Статистика
  getTaskStatistics: () => api.get('/tasks/tasks/statistics/'),
  
  // Напоминания
  getReminders: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/tasks/reminders/?${queryParams}`);
  },
  
  // Создание напоминания
  createReminder: (data) => api.post('/tasks/reminders/', data),
  
  // Обновление напоминания
  updateReminder: (id, data) => api.put(`/tasks/reminders/${id}/`, data),
  
  // Удаление напоминания
  deleteReminder: (id) => api.delete(`/tasks/reminders/${id}/`),
  
  // Предстоящие напоминания
  getUpcomingReminders: () => api.get('/tasks/reminders/upcoming/'),
};