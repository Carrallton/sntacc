import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl as MuiFormControl,
} from '@mui/material';
import {
  Email as EmailIcon,
  Telegram as TelegramIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { notificationService } from '../../services/notifications';
import { plotService } from '../../services/plots';

const UnpaidPlotsList = () => {
  const [plots, setPlots] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPlots, setSelectedPlots] = useState([]);
  const [sending, setSending] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [notificationData, setNotificationData] = useState({
    template_id: '',
    type: 'email',
    year: new Date().getFullYear(),
    amount: '5000',
  });

  useEffect(() => {
    fetchUnpaidPlots();
    fetchTemplates();
  }, [selectedYear]);

  const fetchUnpaidPlots = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getUnpaidPlots(selectedYear);
      setPlots(response.data);
      setSelectedPlots([]); // Сбрасываем выбор при обновлении списка
    } catch (err) {
      setError('Ошибка при загрузке неоплаченных участков: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await notificationService.getTemplates();
      setTemplates(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке шаблонов:', err);
    }
  };

  const handleSelectPlot = (plotId) => {
    setSelectedPlots(prev => 
      prev.includes(plotId) 
        ? prev.filter(id => id !== plotId)
        : [...prev, plotId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlots.length === plots.length) {
      setSelectedPlots([]);
    } else {
      setSelectedPlots(plots.map(plot => plot.id));
    }
  };

  const handleSendBulk = async () => {
    if (selectedPlots.length === 0) {
      setError('Выберите хотя бы один участок');
      return;
    }
    
    if (!notificationData.template_id) {
      setError('Выберите шаблон уведомления');
      return;
    }
    
    setOpenDialog(true);
  };

  const handleConfirmSend = async () => {
    setSending(true);
    setOpenDialog(false);
    
    try {
      const response = await notificationService.sendBulkNotifications({
        template_id: notificationData.template_id,
        plot_ids: selectedPlots,
        type: notificationData.type,
        year: notificationData.year,
        amount: notificationData.amount,
      });
      
      alert(`Отправлено ${response.data.sent} из ${response.data.total} уведомлений`);
      setSelectedPlots([]);
    } catch (err) {
      setError('Ошибка при отправке уведомлений: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Генерируем список лет для фильтра
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

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

  const allSelected = plots.length > 0 && selectedPlots.length === plots.length;
  const someSelected = selectedPlots.length > 0 && !allSelected;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Уведомления о неоплате
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Год</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Год"
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedPlots.length > 0 && (
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSendBulk}
                disabled={sending}
              >
                {sending ? 'Отправка...' : `Отправить (${selectedPlots.length})`}
              </Button>
            )}
          </Box>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={someSelected}
                        checked={allSelected}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Участок</TableCell>
                    <TableCell>Владелец</TableCell>
                    <TableCell>Контакты</TableCell>
                    <TableCell>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary">
                          Все участки оплатили за {selectedYear} год
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    plots.map((plot) => {
                      const isSelected = selectedPlots.includes(plot.id);
                      return (
                        <TableRow 
                          key={plot.id} 
                          selected={isSelected}
                          hover
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectPlot(plot.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {plot.plot_number}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {plot.address}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {plot.current_owner ? (
                              <Box>
                                <Typography variant="body2">
                                  {plot.current_owner.full_name}
                                </Typography>
                                {plot.current_owner.phone && (
                                  <Typography variant="caption" color="textSecondary">
                                    {plot.current_owner.phone}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Chip label="Нет владельца" size="small" color="error" />
                            )}
                          </TableCell>
                          <TableCell>
                            {plot.current_owner?.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="caption">
                                  {plot.current_owner.email}
                                </Typography>
                              </Box>
                            )}
                            {plot.current_owner?.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TelegramIcon fontSize="small" color="action" />
                                <Typography variant="caption">
                                  {plot.current_owner.phone}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="Не оплачен" 
                              color="error" 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Диалог отправки уведомлений */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отправка уведомлений</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <MuiFormControl fullWidth margin="normal">
              <InputLabel>Шаблон уведомления</InputLabel>
              <Select
                name="template_id"
                value={notificationData.template_id}
                onChange={handleChange}
                label="Шаблон уведомления"
              >
                {templates.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name} ({template.type === 'email' ? 'Email' : 'Telegram'})
                  </MenuItem>
                ))}
              </Select>
            </MuiFormControl>
            
            <MuiFormControl fullWidth margin="normal">
              <InputLabel>Тип отправки</InputLabel>
              <Select
                name="type"
                value={notificationData.type}
                onChange={handleChange}
                label="Тип отправки"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="telegram">Telegram</MenuItem>
              </Select>
            </MuiFormControl>
            
            <TextField
              fullWidth
              label="Год"
              name="year"
              type="number"
              value={notificationData.year}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Сумма (руб.)"
              name="amount"
              type="number"
              value={notificationData.amount}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                inputProps: { step: "0.01" }
              }}
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Будет отправлено {selectedPlots.length} уведомлений выбранным владельцам
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleConfirmSend} 
            variant="contained" 
            disabled={sending}
            startIcon={<SendIcon />}
          >
            {sending ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UnpaidPlotsList;