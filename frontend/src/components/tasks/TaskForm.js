import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import { taskService } from '../../services/tasks';
import { authService } from '../../services/auth';

const TaskForm = ({ open, onClose, task, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    assigned_to: task?.assigned_to?.id || '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (open) {
      fetchUsers();
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          due_date: task.due_date ? task.due_date.split('T')[0] : '',
          assigned_to: task.assigned_to?.id || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          due_date: '',
          assigned_to: '',
        });
      }
    }
  }, [open, task]);

  const fetchUsers = async () => {
    try {
      const response = await authService.getCurrentUser();
      // В реальной системе здесь будет запрос к API для получения списка пользователей
      setUsers([
        { id: 1, username: 'admin', full_name: 'Администратор' },
        { id: 2, username: 'user1', full_name: 'Пользователь 1' },
        { id: 3, username: 'user2', full_name: 'Пользователь 2' },
      ]);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        due_date: formData.due_date ? `${formData.due_date}T23:59:59` : null
      };

      if (task) {
        // Обновление существующей задачи
        await taskService.updateTask(task.id, submitData);
      } else {
        // Создание новой задачи
        await taskService.createTask(submitData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении задачи: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'primary';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      case 'urgent': return 'Срочный';
      default: return priority;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {task ? 'Редактировать задачу' : 'Добавить задачу'}
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
          
          <TextField
            fullWidth
            label="Заголовок"
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
              Приоритет
            </InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Приоритет"
            >
              <MenuItem value="low">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={getPriorityText('low')} 
                    color={getPriorityColor('low')} 
                    size="small"
                    sx={{ height: 20 }}
                  />
                </Box>
              </MenuItem>
              <MenuItem value="medium">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={getPriorityText('medium')} 
                    color={getPriorityColor('medium')} 
                    size="small"
                    sx={{ height: 20 }}
                  />
                </Box>
              </MenuItem>
              <MenuItem value="high">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={getPriorityText('high')} 
                    color={getPriorityColor('high')} 
                    size="small"
                    sx={{ height: 20 }}
                  />
                </Box>
              </MenuItem>
              <MenuItem value="urgent">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={getPriorityText('urgent')} 
                    color={getPriorityColor('urgent')} 
                    size="small"
                    sx={{ height: 20 }}
                  />
                </Box>
              </MenuItem>
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
              Статус
            </InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Статус"
            >
              <MenuItem value="pending">В ожидании</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="completed">Завершено</MenuItem>
              <MenuItem value="cancelled">Отменено</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Срок выполнения"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
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
              Назначить
            </InputLabel>
            <Select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              label="Назначить"
            >
              <MenuItem value="">Не назначено</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: '1rem' }} />
                    <span>{user.full_name || user.username}</span>
                  </Box>
                </MenuItem>
              ))}
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
          disabled={loading}
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

export default TaskForm;