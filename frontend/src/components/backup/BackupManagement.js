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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { backupService } from '../../services/backup';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [backupData, setBackupData] = useState({
    name: '',
    type: 'full',
  });

  useEffect(() => {
    fetchBackups();
    fetchSchedules();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await backupService.getBackups();
      setBackups(response.data);
    } catch (err) {
      setError('Ошибка при загрузке резервных копий: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await backupService.getSchedules();
      setSchedules(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписаний:', err);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setError(null);
    
    try {
      const backupName = backupData.name || `Backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
      await backupService.createBackup({
        name: backupName,
        type: backupData.type,
      });
      fetchBackups();
      setOpenDialog(false);
      setBackupData({ name: '', type: 'full' });
    } catch (err) {
      setError('Ошибка при создании резервной копии: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backupId) => {
    try {
      const response = await backupService.downloadBackup(backupId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${backupId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Ошибка при скачивании резервной копии: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
      try {
        await backupService.deleteBackup(backupId);
        fetchBackups();
      } catch (err) {
        setError('Ошибка при удалении резервной копии: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'В ожидании';
      case 'processing': return 'В процессе';
      case 'completed': return 'Завершено';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'full': return 'Полная';
      case 'incremental': return 'Инкрементальная';
      default: return type;
    }
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Резервное копирование
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Создать резервную копию
          </Button>
        </Box>
      </Grid>
      
      {/* Статистика */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Всего резервных копий
                </Typography>
                <Typography variant="h5">
                  {backups.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Успешных копий
                </Typography>
                <Typography variant="h5" color="success.main">
                  {backups.filter(b => b.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Расписаний
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {schedules.filter(s => s.is_active).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Список резервных копий */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Резервные копии
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Размер</TableCell>
                    <TableCell>Создано</TableCell>
                    <TableCell>Завершено</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {backup.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {backup.created_by_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getTypeText(backup.type)} 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(backup.status)} 
                          color={getStatusColor(backup.status)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {backup.file_size_mb ? `${backup.file_size_mb} MB` : '—'}
                      </TableCell>
                      <TableCell>
                        {new Date(backup.created_at).toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        {backup.completed_at ? 
                          new Date(backup.completed_at).toLocaleString('ru-RU') : 
                          '—'
                        }
                      </TableCell>
                      <TableCell>
                        {backup.status === 'completed' && (
                          <Tooltip title="Скачать">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadBackup(backup.id)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteBackup(backup.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Расписания резервного копирования */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Расписания резервного копирования
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ScheduleIcon />}
              >
                Добавить расписание
              </Button>
            </Box>
            
            {schedules.length === 0 ? (
              <Typography color="textSecondary">
                Нет активных расписаний
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Частота</TableCell>
                      <TableCell>Время</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Последний запуск</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{schedule.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={schedule.frequency} 
                            size="small"
                            color={schedule.is_active ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>
                          <Chip 
                            label={schedule.is_active ? 'Активно' : 'Неактивно'} 
                            size="small"
                            color={schedule.is_active ? 'success' : 'default'}
                            variant={schedule.is_active ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          {schedule.last_run ? 
                            new Date(schedule.last_run).toLocaleString('ru-RU') : 
                            'Никогда'
                          }
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <ScheduleIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Диалог создания резервной копии */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создание резервной копии</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              label="Название резервной копии"
              name="name"
              value={backupData.name}
              onChange={(e) => setBackupData({...backupData, name: e.target.value})}
              margin="normal"
              helperText="Если не указано, будет использована текущая дата и время"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Тип резервной копии</InputLabel>
              <Select
                name="type"
                value={backupData.type}
                onChange={(e) => setBackupData({...backupData, type: e.target.value})}
                label="Тип резервной копии"
              >
                <MenuItem value="full">Полная копия</MenuItem>
                <MenuItem value="incremental">Инкрементальная копия</MenuItem>
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Резервная копия будет включать:
                <ul>
                  <li>Все данные базы данных</li>
                  <li>Все загруженные файлы</li>
                  <li>Настройки системы</li>
                </ul>
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateBackup} 
            variant="contained" 
            disabled={creating}
            startIcon={creating ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
          >
            {creating ? 'Создание...' : 'Создать резервную копию'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default BackupManagement;