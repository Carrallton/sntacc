import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Assignment as TaskIcon,
  Notifications as NotificationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { taskService } from '../../services/tasks';
import TaskForm from './TaskForm';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
  });
  const [statistics, setStatistics] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
  }, [activeTab]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 0: // Все задачи
          response = await taskService.getTasks();
          break;
        case 1: // Мои задачи
          response = await taskService.getMyTasks();
          break;
        case 2: // Просроченные
          response = await taskService.getOverdueTasks();
          break;
        default:
          response = await taskService.getTasks();
      }
      
      setTasks(response.data);
      setAllTasks(response.data);
    } catch (err) {
      setError('Ошибка при загрузке задач: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await taskService.getTaskStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = [...allTasks];
    
    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Фильтры
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    
    setTasks(filtered);
  }, [searchQuery, filters, allTasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setOpenForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpenForm(true);
  };

  const handleDeleteTask = (task) => {
    setDeleteDialog({ open: true, task });
  };

  const handleCompleteTask = async (task) => {
    try {
      await taskService.completeTask(task.id);
      fetchTasks();
      fetchStatistics();
    } catch (err) {
      setError('Ошибка при завершении задачи: ' + (err.response?.data?.detail || err.message));
    }
  };

  const confirmDelete = async () => {
    try {
      await taskService.deleteTask(deleteDialog.task.id);
      fetchTasks();
      fetchStatistics();
      setDeleteDialog({ open: false, task: null });
    } catch (err) {
      setError('Ошибка при удалении задачи: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchTasks();
    fetchStatistics();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'В ожидании';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignedTo: '',
    });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={isMobile ? 1 : 3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom
            sx={{ fontSize: isMobile ? '1.25rem' : '2rem' }}
          >
            <TaskIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Задачи и напоминания
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? 'Добавить' : 'Добавить задачу'}
          </Button>
        </Box>
      </Grid>
      
      {/* Статистика */}
      {statistics && (
        <Grid item xs={12}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Всего
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Завершено
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="success.main"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.completed}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                  >
                    {statistics.completion_rate}% выполнено
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    В работе
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="warning.main"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.in_progress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    В ожидании
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="text.primary"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Просрочено
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="error.main"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.overdue}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: isMobile ? 1 : 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{ 
                mb: 2,
                minHeight: isMobile ? 36 : 48,
                '& .MuiTab-root': {
                  minHeight: isMobile ? 36 : 48,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  py: isMobile ? 0.5 : 1
                }
              }}
            >
              <Tab 
                label={
                  <Badge 
                    badgeContent={statistics?.total || 0} 
                    color="primary"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: isMobile ? '0.5rem' : '0.75rem',
                        height: isMobile ? 16 : 20,
                        minWidth: isMobile ? 16 : 20
                      }
                    }}
                  >
                    Все задачи
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={statistics?.pending || 0} 
                    color="warning"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: isMobile ? '0.5rem' : '0.75rem',
                        height: isMobile ? 16 : 20,
                        minWidth: isMobile ? 16 : 20
                      }
                    }}
                  >
                    Мои задачи
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={statistics?.overdue || 0} 
                    color="error"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: isMobile ? '0.5rem' : '0.75rem',
                        height: isMobile ? 16 : 20,
                        minWidth: isMobile ? 16 : 20
                      }
                    }}
                  >
                    Просрочено
                  </Badge>
                } 
                icon={<WarningIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
              />
            </Tabs>
            
            {/* Поиск и фильтры */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Поиск"
                  placeholder="Заголовок, описание..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, fontSize: isMobile ? '1rem' : '1.25rem' }} />,
                  }}
                  size={isMobile ? "small" : "medium"}
                  sx={{ minWidth: isMobile ? '100%' : 200 }}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  size={isMobile ? "small" : "medium"}
                >
                  Фильтры
                </Button>
                
                {(searchQuery || Object.values(filters).some(v => v)) && (
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    size={isMobile ? "small" : "medium"}
                  >
                    Сбросить
                  </Button>
                )}
              </Box>
              
              {showFilters && (
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Статус</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        label="Статус"
                      >
                        <MenuItem value="">Все</MenuItem>
                        <MenuItem value="pending">В ожидании</MenuItem>
                        <MenuItem value="in_progress">В работе</MenuItem>
                        <MenuItem value="completed">Завершено</MenuItem>
                        <MenuItem value="cancelled">Отменено</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Приоритет</InputLabel>
                      <Select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        label="Приоритет"
                      >
                        <MenuItem value="">Все</MenuItem>
                        <MenuItem value="low">Низкий</MenuItem>
                        <MenuItem value="medium">Средний</MenuItem>
                        <MenuItem value="high">Высокий</MenuItem>
                        <MenuItem value="urgent">Срочный</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </Box>
            
            <TableContainer component={Paper}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Задача
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Приоритет
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Статус
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Срок
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Назначено
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Действия
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow 
                      key={task.id} 
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: task.is_overdue ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography 
                            variant="caption" 
                            color="textSecondary"
                            sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem', display: 'block' }}
                          >
                            {task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        <Chip 
                          label={getPriorityText(task.priority)} 
                          color={getPriorityColor(task.priority)} 
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            fontSize: isMobile ? '0.625rem' : '0.75rem',
                            height: isMobile ? 20 : 24
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        <Chip 
                          label={getStatusText(task.status)} 
                          color={getStatusColor(task.status)} 
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            fontSize: isMobile ? '0.625rem' : '0.75rem',
                            height: isMobile ? 20 : 24
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        {task.due_date ? (
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                            >
                              {new Date(task.due_date).toLocaleDateString('ru-RU')}
                            </Typography>
                            {task.is_overdue && (
                              <Chip 
                                icon={<WarningIcon />} 
                                label="Просрочено" 
                                color="error" 
                                size="small"
                                sx={{ 
                                  fontSize: isMobile ? '0.5rem' : '0.625rem',
                                  height: isMobile ? 16 : 20,
                                  mt: 0.5
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        {task.assigned_to ? (
                          <Typography 
                            variant="body2" 
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                          >
                            {task.assigned_to.full_name || task.assigned_to.username}
                          </Typography>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {task.status !== 'completed' && (
                            <IconButton 
                              size={isMobile ? "small" : "medium"}
                              onClick={() => handleCompleteTask(task)}
                              title="Завершить"
                            >
                              <CheckIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                            </IconButton>
                          )}
                          <IconButton 
                            size={isMobile ? "small" : "medium"}
                            onClick={() => handleEditTask(task)}
                            title="Редактировать"
                          >
                            <EditIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                          </IconButton>
                          <IconButton 
                            size={isMobile ? "small" : "medium"}
                            onClick={() => handleDeleteTask(task)}
                            title="Удалить"
                            color="error"
                          >
                            <DeleteIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {tasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  Задачи не найдены
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Форма задачи */}
      <TaskForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        task={editingTask}
        onSuccess={handleFormSuccess}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, task: null })}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Вы уверены, что хотите удалить задачу "{deleteDialog.task?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <Button
            onClick={() => setDeleteDialog({ open: false, task: null })}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained" 
            color="error"
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default TaskList;