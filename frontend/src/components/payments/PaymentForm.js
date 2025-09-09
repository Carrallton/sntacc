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
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { paymentService } from '../../services/payments';

const PaymentForm = ({ open, onClose, payment, onSuccess, plots, year }) => {
  const [formData, setFormData] = useState({
    plot_id: payment?.plot?.id || '',
    year: payment?.year || year || new Date().getFullYear(),
    amount: payment?.amount || '',
    date_paid: payment?.date_paid || '',
    status: payment?.status || 'not_paid',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useTodayDate, setUseTodayDate] = useState(!!payment?.date_paid);

  useEffect(() => {
    if (open) {
      if (payment) {
        setFormData({
          plot_id: payment.plot?.id || '',
          year: payment.year || '',
          amount: payment.amount || '',
          date_paid: payment.date_paid || '',
          status: payment.status || 'not_paid',
        });
        setUseTodayDate(!!payment.date_paid);
      } else {
        setFormData({
          plot_id: '',
          year: year || new Date().getFullYear(),
          amount: '',
          date_paid: '',
          status: 'not_paid',
        });
        setUseTodayDate(false);
      }
    }
  }, [open, payment, year]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setFormData({
      ...formData,
      status,
    });
    
    // Если статус "оплачен", автоматически ставим сегодняшнюю дату
    if (status === 'paid' && !formData.date_paid) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        status,
        date_paid: today
      }));
      setUseTodayDate(true);
    }
  };

  const handleUseTodayDateChange = (e) => {
    const checked = e.target.checked;
    setUseTodayDate(checked);
    
    if (checked) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        ...formData,
        date_paid: today
      });
    } else {
      setFormData({
        ...formData,
        date_paid: ''
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Подготавливаем данные для отправки
    const submitData = {
      plot_id: parseInt(formData.plot_id),
      year: parseInt(formData.year),
      amount: parseFloat(formData.amount),
      status: formData.status,
    };

    // Добавляем дату оплаты только если она указана
    if (formData.date_paid) {
      submitData.date_paid = formData.date_paid;
    }

    console.log('Отправляемые данные:', submitData);

    if (payment) {
      // Обновление существующего платежа
      await paymentService.update(payment.id, submitData);
    } else {
      // Создание нового платежа
      await paymentService.create(submitData);
    }
    onSuccess();
    onClose();
  } catch (err) {
    console.error('Ошибка при сохранении платежа:', err);
    console.error('Детали ошибки:', err.response?.data);
    setError('Ошибка при сохранении платежа: ' + 
      (err.response?.data?.detail || 
       JSON.stringify(err.response?.data) || 
       err.message));
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {payment ? 'Редактировать платеж' : 'Добавить платеж'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Участок</InputLabel>
                <Select
                  name="plot_id"
                  value={formData.plot_id}
                  onChange={handleChange}
                  label="Участок"
                  disabled={!!payment} // Запрещаем менять участок при редактировании
                >
                  {plots.map((plot) => (
                    <MenuItem key={plot.id} value={plot.id}>
                      {plot.plot_number} - {plot.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Год"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                margin="normal"
                required
                disabled={!!payment} // Запрещаем менять год при редактировании
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Сумма (руб.)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  inputProps: { step: "0.01" }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  label="Статус"
                >
                  <MenuItem value="not_paid">Не оплачен</MenuItem>
                  <MenuItem value="paid">Оплачен</MenuItem>
                  <MenuItem value="partial">Частично оплачен</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.status === 'paid' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useTodayDate}
                      onChange={handleUseTodayDateChange}
                    />
                  }
                  label="Использовать сегодняшнюю дату"
                />
                
                <TextField
                  fullWidth
                  label="Дата оплаты"
                  name="date_paid"
                  type="date"
                  value={formData.date_paid}
                  onChange={handleChange}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={useTodayDate}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;