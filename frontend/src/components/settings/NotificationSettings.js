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
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';
import { settingsService } from '../../services/settings';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    notification_email: '',
    telegram_bot_token: '',
    smtp_enabled: true,
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    telegram_enabled: true,
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
      setSettings({
        notification_email: response.data.notification_email || '',
        telegram_bot_token: response.data.telegram_bot_token || '',
        smtp_enabled: true,
        smtp_host: response.data.smtp_host || '',
        smtp_port: response.data.smtp_port || '',
        smtp_username: response.data.smtp_username || '',
        smtp_password: response.data.smtp_password || '',
        telegram_enabled: true,
      });
    } catch (err) {
      setError('Ошибка при загрузке настроек: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        smtp_port: parseInt(settings.smtp_port) || 0
      };
      
      await settingsService.saveSettings(submitData);
      setSuccess('Настройки уведомлений успешно сохранены');
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
          Настройки уведомлений
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
                {/* Email настройки */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Email уведомления
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          name="smtp_enabled"
                          checked={settings.smtp_enabled}
                          onChange={handleChange}
                        />
                      }
                      label="Включено"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email для уведомлений"
                    name="notification_email"
                    type="email"
                    value={settings.notification_email}
                    onChange={handleChange}
                    disabled={!settings.smtp_enabled}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Настройки SMTP сервера</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="SMTP сервер"
                            name="smtp_host"
                            value={settings.smtp_host}
                            onChange={handleChange}
                            disabled={!settings.smtp_enabled}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Порт"
                            name="smtp_port"
                            type="number"
                            value={settings.smtp_port}
                            onChange={handleChange}
                            disabled={!settings.smtp_enabled}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Имя пользователя"
                            name="smtp_username"
                            value={settings.smtp_username}
                            onChange={handleChange}
                            disabled={!settings.smtp_enabled}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Пароль"
                            name="smtp_password"
                            type="password"
                            value={settings.smtp_password}
                            onChange={handleChange}
                            disabled={!settings.smtp_enabled}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
                
                {/* Telegram настройки */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                    <TelegramIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Telegram уведомления
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          name="telegram_enabled"
                          checked={settings.telegram_enabled}
                          onChange={handleChange}
                        />
                      }
                      label="Включено"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Token Telegram бота"
                    name="telegram_bot_token"
                    value={settings.telegram_bot_token}
                    onChange={handleChange}
                    disabled={!settings.telegram_enabled}
                    helperText="Получите token у @BotFather в Telegram"
                  />
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

export default NotificationSettings;