import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Typography,
  useMediaQuery,
  Chip,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { documentService } from '../../services/documents';

const DocumentForm = ({ open, onClose, document, onSuccess, categories, tags }) => {
  const [formData, setFormData] = useState({
    title: document?.title || '',
    description: document?.description || '',
    category: document?.category?.id || '',
    document_type: document?.document_type || 'other',
    file: null,
    status: document?.status || 'active',
    related_plot: document?.related_plot?.id || '',
    related_owner: document?.related_owner?.id || '',
    tags: document?.tags?.map(tag => tag.id) || [],
  });
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null); // Добавлен ref для input файла
  const isMobile = useMediaQuery('(max-width:600px)');

  // frontend/src/components/documents/DocumentForm.js - обновим useEffect
useEffect(() => {
    if (open) {
        if (document) {
        setFormData({
            title: document.title || '',
            description: document.description || '',
            category: document.category?.id || '',
            document_type: document.document_type || 'other',
            file: null,
            status: document.status || 'active',
            related_plot: document.related_plot?.id || '',
            related_owner: document.related_owner?.id || '',
            tags: document.tags?.map(tag => tag.id) || [],
        });
        setFilePreview(document.file_url);
        } else {
        setFormData({
            title: '',
            description: '',
            category: '',
            document_type: 'other',
            file: null,
            status: 'active',
            related_plot: '',
            related_owner: '',
            tags: [],
        });
        setFilePreview(null);
        }
    }
    }, [open, document]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      
      // Создаем превью файла
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    // Используем ref вместо getElementById
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      tags: newValue.map(tag => typeof tag === 'string' ? tag : tag.id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        console.log('Подготовка данных для отправки:', formData);
        
        // Проверяем обязательные поля
        if (!formData.title?.trim()) {
        throw new Error('Заголовок обязателен');
        }
        
        if (!formData.file && !document) {
        throw new Error('Файл обязателен для нового документа');
        }
        
        const submitData = new FormData();
        
        // Добавляем все поля
        Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        if (key === 'tags' && Array.isArray(value)) {
            // Теги
            value.forEach(tagId => {
            if (tagId) {
                submitData.append('tags', tagId);
            }
            });
        } else if (key === 'file' && value) {
            // Файл
            submitData.append(key, value);
        } else if (key === 'category' && value) {
            submitData.append(key, value);
        } else if (key === 'related_plot' && value) {
            submitData.append(key, value);
        } else if (key === 'related_owner' && value) {
            submitData.append(key, value);
        } else if (key !== 'file' && key !== 'tags' && key !== 'category' && 
                    key !== 'related_plot' && key !== 'related_owner') {
            // Все остальные поля
            if (value !== null && value !== undefined && value !== '') {
            submitData.append(key, value);
            } else if (!document && (key === 'document_type' || key === 'status')) {
            // Для новых документов устанавливаем значения по умолчанию
            if (key === 'document_type') {
                submitData.append(key, 'other');
            } else if (key === 'status') {
                submitData.append(key, 'active');
            }
            }
        }
        });
        
        // Убеждаемся, что обязательные поля установлены
        if (!submitData.has('document_type')) {
        submitData.append('document_type', 'other');
        }
        if (!submitData.has('status')) {
        submitData.append('status', 'active');
        }
        
        console.log('Отправляемые данные:');
        for (let [key, value] of submitData.entries()) {
        console.log(key, value);
        }
        
        if (document) {
        // Обновление существующего документа - исправлено
        console.log('Обновление документа с ID:', document.id);
        await documentService.updateDocument(document.id, submitData);
        } else {
        // Создание нового документа
        console.log('Создание нового документа');
        await documentService.createDocument(submitData);
        }
        onSuccess();
        onClose();
    } catch (err) {
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.detail || 
                            err.response?.data?.title || 
                            err.response?.data?.[0] || // Для ошибок валидации полей
                            err.response?.data?.non_field_errors?.[0] ||
                            err.message || 
                            'Ошибка при сохранении документа';
        
        setError(`Ошибка при сохранении документа: ${errorMessage}`);
        console.error('Ошибка при сохранении документа:', err);
        console.error('Детали ошибки:', err.response?.data);
    } finally {
        setLoading(false);
    }
    };

  const tagOptions = tags.map(tag => ({
    id: tag.id,
    label: tag.name,
    color: tag.color
  }));

  const selectedTags = formData.tags.map(tagId => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? { id: tag.id, label: tag.name, color: tag.color } : null;
  }).filter(Boolean);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {document ? 'Редактировать документ' : 'Добавить документ'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: isMobile ? 0 : 2,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 1 : 2
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.875rem' : 'inherit'
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Загрузка файла */}
          <Box 
            sx={{ 
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                borderColor: 'primary.main'
              }
            }}
            onClick={triggerFileInput}  // Используем функцию с ref
          >
            <input
              ref={fileInputRef}  // Добавлен ref
              type="file"
              accept="*/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {filePreview ? (
              <Box sx={{ position: 'relative' }}>
                {filePreview.startsWith('data:image') ? (
                  <img 
                    src={filePreview} 
                    alt="Превью" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200,
                      borderRadius: 4
                    }}
                  />
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="textSecondary">
                      Файл загружен
                    </Typography>
                  </Box>
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {formData.file ? formData.file.name : 'Изменить файл'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography 
                  color="textSecondary"
                  sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                >
                  Нажмите для выбора файла
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                  sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', display: 'block', mt: 1 }}
                >
                  Поддерживаются все форматы файлов
                </Typography>
              </Box>
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Название документа"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mt: isMobile ? 0 : 2,
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : 'inherit'
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : 'inherit'
              }
            }}
          />
          
          <FormControl 
            fullWidth 
            margin="normal"
            size={isMobile ? "small" : "medium"}
          >
            <InputLabel 
              sx={{ 
                fontSize: isMobile ? '0.875rem' : 'inherit' 
              }}
            >
              Категория
            </InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Категория"
            >
              <MenuItem value="">Без категории</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl 
            fullWidth 
            margin="normal"
            size={isMobile ? "small" : "medium"}
          >
            <InputLabel 
              sx={{ 
                fontSize: isMobile ? '0.875rem' : 'inherit' 
              }}
            >
              Тип документа
            </InputLabel>
            <Select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              label="Тип документа"
            >
              <MenuItem value="receipt">Квитанция</MenuItem>
              <MenuItem value="contract">Договор</MenuItem>
              <MenuItem value="protocol">Протокол</MenuItem>
              <MenuItem value="resolution">Решение</MenuItem>
              <MenuItem value="invoice">Счет</MenuItem>
              <MenuItem value="act">Акт</MenuItem>
              <MenuItem value="other">Другое</MenuItem>
            </Select>
          </FormControl>
          
          <Autocomplete
            multiple
            options={tagOptions}
            getOptionLabel={(option) => option.label}
            value={selectedTags}
            onChange={handleTagsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Теги"
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  mt: isMobile ? 0 : 2,
                  '& .MuiInputLabel-root': {
                    fontSize: isMobile ? '0.875rem' : 'inherit'
                  }
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.label}
                  {...getTagProps({ index })}
                  size="small"
                  sx={{ 
                    height: isMobile ? 20 : 24,
                    fontSize: isMobile ? '0.625rem' : '0.75rem'
                  }}
                />
              ))
            }
          />
          
          <FormControl 
            fullWidth 
            margin="normal"
            size={isMobile ? "small" : "medium"}
          >
            <InputLabel 
              sx={{ 
                fontSize: isMobile ? '0.875rem' : 'inherit' 
              }}
            >
              Статус
            </InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Статус"
            >
              <MenuItem value="draft">Черновик</MenuItem>
              <MenuItem value="active">Активный</MenuItem>
              <MenuItem value="archived">В архиве</MenuItem>
              <MenuItem value="deleted">Удален</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          p: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}
      >
        <Button
          onClick={onClose}
          sx={{ 
            fontSize: isMobile ? '0.875rem' : 'inherit',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.title || (!formData.file && !document)}
          sx={{ 
            fontSize: isMobile ? '0.875rem' : 'inherit',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentForm;