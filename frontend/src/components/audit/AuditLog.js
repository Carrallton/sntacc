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
  Chip,
  Box,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { auditService } from '../../services/audit';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    model_name: '',
    start_date: '',
    end_date: '',
  });
  const [openFilter, setOpenFilter] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [activeTab, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 0) {
        // Последние записи
        response = await auditService.getRecentLogs(100);
      } else {
        // Фильтрованные записи
        response = await auditService.filterLogs(filters);
      }
      
      setLogs(response.data);
    } catch (err) {
      setError('Ошибка при загрузке логов аудита: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await auditService.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'warning';
      case 'delete': return 'error';
      case 'login': return 'primary';
      case 'logout': return 'secondary';
      case 'send_notification': return 'info';
      case 'generate_report': return 'primary';
      case 'backup': return 'primary';
      default: return 'default';
    }
  };

  const getActionText = (action) => {
    if (!action) return 'Неизвестно';
    switch (action) {
      case 'create': return 'Создание';
      case 'update': return 'Обновление';
      case 'delete': return 'Удаление';
      case 'login': return 'Вход';
      case 'logout': return 'Выход';
      case 'view': return 'Просмотр';
      case 'export': return 'Экспорт';
      case 'import': return 'Импорт';
      case 'send_notification': return 'Уведомление';
      case 'generate_report': return 'Отчет';
      case 'backup': return 'Резервная копия';
      default: return action;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
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
      {/* Статистика */}
      {statistics && (
        <Grid item xs={12}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Всего записей
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {(statistics.total_logs || 0)?.toLocaleString('ru-RU')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    За 24 часа
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="primary.main"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {(statistics.logs_24h || 0)?.toLocaleString('ru-RU')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Популярное действие
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.action_stats?.[0]?.action ? getActionText(statistics.action_stats?.[0]?.action) : '—'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                  >
                    {(statistics.action_stats?.[0]?.count || 0)} раз
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Активный пользователь
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.top_users?.[0]?.user__username || '—'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                  >
                    {(statistics.top_users?.[0]?.count || 0)} действий
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}
      
      {/* Табы */}
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
              <Tab label="Последние действия" />
              <Tab label="Фильтрованные" />
            </Tabs>
            
            <TableContainer component={Paper}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}>
                      Пользователь
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}>
                      Действие
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}>
                      Объект
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}>
                      Время
                    </TableCell>
                    {isMobile ? null : (
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}>
                        IP
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        fontSize: isMobile ? '0.75rem' : 'inherit'
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }} />
                          <span>{log.user_display}</span>
                        </Box>
                      </TableCell>
                      <TableCell 
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}
                      >
                        <Chip 
                          label={getActionText(log.action)} 
                          color={getActionColor(log.action)} 
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            fontSize: isMobile ? '0.625rem' : '0.75rem',
                            height: isMobile ? 20 : 24
                          }}
                        />
                      </TableCell>
                      <TableCell 
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}
                      >
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                          >
                            {log.object_repr}
                          </Typography>
                          {log.model_name && (
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                            >
                              {log.model_name}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell 
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ComputerIcon sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }} />
                          <span>{formatDate(log.timestamp)}</span>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell 
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 0.5 : 1 }}
                        >
                          {log.ip_address || '—'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Диалог фильтрации */}
      <Dialog 
        open={openFilter} 
        onClose={() => setOpenFilter(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Фильтрация логов
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="ID пользователя"
              type="number"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : 'inherit'
                }
              }}
            />
            
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Действие</InputLabel>
              <Select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                label="Действие"
              >
                <MenuItem value="">Все действия</MenuItem>
                <MenuItem value="create">Создание</MenuItem>
                <MenuItem value="update">Обновление</MenuItem>
                <MenuItem value="delete">Удаление</MenuItem>
                <MenuItem value="login">Вход</MenuItem>
                <MenuItem value="logout">Выход</MenuItem>
                <MenuItem value="send_notification">Уведомление</MenuItem>
                <MenuItem value="generate_report">Отчет</MenuItem>
                <MenuItem value="backup">Резервная копия</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Модель"
              value={filters.model_name}
              onChange={(e) => handleFilterChange('model_name', e.target.value)}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : 'inherit'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Начальная дата"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : 'inherit'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Конечная дата"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : 'inherit'
                }
              }}
            />
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
            onClick={() => {
              setFilters({
                user_id: '',
                action: '',
                model_name: '',
                start_date: '',
                end_date: '',
              });
              setOpenFilter(false);
            }}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Сбросить
          </Button>
          <Button
            onClick={() => setOpenFilter(false)}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={() => setOpenFilter(false)}
            variant="contained"
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AuditLog;