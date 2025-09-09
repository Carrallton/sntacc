import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { settingsService } from '../../services/settings';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    organization_name: '',
    organization_address: '',
    chairman_name: '',
    chairman_phone: '',
    chairman_email: '',
    annual_fee: '',
    currency: 'RUB',
    language: 'ru',
    timezone: 'Europe/Moscow',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Ошибка при загрузке настроек: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const submitData = {
        ...settings,
        annual_fee: parseFloat(settings.annual_fee) || 0
      };
      
      await settingsService.saveSettings(submitData);
      setSuccess('Настройки успешно сохранены');
    } catch (err) {
      setError('Ошибка при сохранении настроек: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Общие настройки
        </Typography>
      </Grid>
      
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}
      
      {success && (
        <Grid item xs={12}>
          <Alert severity="success">{success}</Alert>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Информация об организации
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Название организации"
                    name="organization_name"
                    value={settings.organization_name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Адрес организации"
                    name="organization_address"
                    value={settings.organization_address}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Председатель
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ФИО председателя"
                    name="chairman_name"
                    value={settings.chairman_name}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Телефон председателя"
                    name="chairman_phone"
                    value={settings.chairman_phone}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Email председателя"
                    name="chairman_email"
                    type="email"
                    value={settings.chairman_email}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Финансовые настройки
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Годовой взнос"
                    name="annual_fee"
                    type="number"
                    value={settings.annual_fee}
                    onChange={handleChange}
                    InputProps={{
                      inputProps: { step: "0.01" }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Валюта</InputLabel>
                    <Select
                      name="currency"
                      value={settings.currency}
                      onChange={handleChange}
                      label="Валюта"
                    >
                      <MenuItem value="RUB">Рубль (RUB)</MenuItem>
                      <MenuItem value="USD">Доллар (USD)</MenuItem>
                      <MenuItem value="EUR">Евро (EUR)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Системные настройки
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Язык</InputLabel>
                    <Select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                      label="Язык"
                    >
                      <MenuItem value="ru">Русский</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Часовой пояс</InputLabel>
                    <Select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleChange}
                      label="Часовой пояс"
                    >
                      <MenuItem value="Europe/Moscow">Москва (GMT+3)</MenuItem>
                      <MenuItem value="Asia/Yekaterinburg">Екатеринбург (GMT+5)</MenuItem>
                      <MenuItem value="Asia/Novosibirsk">Новосибирск (GMT+7)</MenuItem>
                      <MenuItem value="Asia/Vladivostok">Владивосток (GMT+10)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={saving}
                    >
                      {saving ? 'Сохранение...' : 'Сохранить настройки'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default GeneralSettings;