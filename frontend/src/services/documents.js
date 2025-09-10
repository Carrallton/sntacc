import api from './api';

export const documentService = {
  // Получение документов
  getDocuments: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/documents/?${queryParams}`);
  },
  
  // Создание документа
  createDocument: async (data) => {
    try {
      console.log('Отправка данных документа:', data);
      
      const formData = new FormData();
      
      // Добавляем все поля
      Object.keys(data).forEach(key => {
        if (key === 'tags' && Array.isArray(data[key])) {
          // Теги добавляем как массив
          data[key].forEach((tagId, index) => {
            formData.append(`tags[${index}]`, tagId);
          });
          // Или как несколько полей tags
          data[key].forEach(tagId => {
            formData.append('tags', tagId);
          });
        } else if (key === 'file' && data[key]) {
          formData.append(key, data[key]);
        } else if (key !== 'file' && key !== 'tags') {
          formData.append(key, data[key]);
        }
      });
      
      console.log('FormData для отправки:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await api.post('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Ответ от сервера:', response.data);
      return response;
      
    } catch (error) {
      console.error('Ошибка при создании документа:', error);
      console.error('Детали ошибки:', error.response?.data);
      throw error;
    }
  },
  
  // Обновление документа
  updateDocument: (id, data) => {
    // Проверяем, что id определен
    if (!id) {
      console.error('ID документа не определен');
      return Promise.reject(new Error('ID документа не определен'));
    }
    
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'tags' && Array.isArray(data[key])) {
        data[key].forEach(tagId => {
          formData.append('tags', tagId);
        });
      } else if (key === 'file' && data[key]) {
        formData.append(key, data[key]);
      } else if (key !== 'file' && key !== 'tags') {
        formData.append(key, data[key]);
      }
    });
    
    console.log(`Отправка PUT запроса на /documents/${id}/`);
    return api.put(`/documents/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Удаление документа
  deleteDocument: (id) => api.delete(`/documents/${id}/`),
  
  // Получение категорий документов
  getCategories: () => api.get('/documents/categories/'),
  
  // Создание категории
  createCategory: (data) => api.post('/documents/categories/', data),
  
  // Получение тегов документов
  getTags: () => api.get('/documents/tags/'),
  
  // Создание тега
  createTag: (data) => api.post('/documents/tags/', data),
  
  // Статистика
  getStatistics: () => api.get('/documents/statistics/'),
  
  // Документы по участку
  getDocumentsByPlot: (plotId) => api.get(`/documents/by_plot/?plot_id=${plotId}`),
  
  // Документы по собственнику
  getDocumentsByOwner: (ownerId) => api.get(`/documents/by_owner/?owner_id=${ownerId}`),
  
  // Скачивание документа
  downloadDocument: (documentId) => api.get(`/documents/${documentId}/download/`, {
    responseType: 'blob'
  }),
};