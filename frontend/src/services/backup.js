import api from './api';

export const backupService = {
  // Получение списка резервных копий
  getBackups: () => api.get('/backup/backups/'),
  
  // Создание резервной копии
  createBackup: (data) => api.post('/backup/backups/create_backup/', data),
  
  // Скачивание резервной копии
  downloadBackup: (id) => api.get(`/backup/backups/${id}/download/`, {
    responseType: 'blob'
  }),
  
  // Удаление файла резервной копии
  deleteBackupFile: (id) => api.post(`/backup/backups/${id}/delete_file/`),
  
  // Удаление записи о резервной копии
  deleteBackup: (id) => api.delete(`/backup/backups/${id}/`),
  
  // Получение расписаний
  getSchedules: () => api.get('/backup/schedules/'),
  
  // Создание расписания
  createSchedule: (data) => api.post('/backup/schedules/', data),
  
  // Обновление расписания
  updateSchedule: (id, data) => api.put(`/backup/schedules/${id}/`, data),
  
  // Удаление расписания
  deleteSchedule: (id) => api.delete(`/backup/schedules/${id}/`),
};