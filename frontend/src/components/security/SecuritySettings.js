import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  QrCode as QrCodeIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { authService } from '../../services/auth';

const SecuritySettings = () => {
  const [securitySettings, setSecuritySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open2FADialog, setOpen2FADialog] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await authService.getSecuritySettings();
      setSecuritySettings(response);
    } catch (err) {
      setError('Ошибка при загрузке настроек безопасности: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await authService.enable2FA();
      setQrCodeData(response.qr_code);
      setSecretKey(response.secret);
      setOpen2FADialog(true);
    } catch (err) {
      setError('Ошибка при включении 2FA: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleVerify2FA = async () => {
    try {
      await authService.verifyAndEnable2FA(twoFAToken);
      setSuccess('Двухфакторная аутентификация включена');
      setOpen2FADialog(false);
      setTwoFAToken('');
      fetchSecuritySettings();
    } catch (err) {
      setError('Ошибка при подтверждении 2FA: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию?')) {
      try {
        await authService.disable2FA();
        setSuccess('Двухфакторная аутентификация отключена');
        fetchSecuritySettings();
      } catch (err) {
        setError('Ошибка при отключении 2FA: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (passwordData.new_password.length < (securitySettings?.min_password_length || 8)) {
      setError(`Пароль должен содержать минимум ${securitySettings?.min_password_length || 8} символов`);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.changePassword(passwordData);
      setSuccess('Пароль успешно изменен');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      setError('Ошибка при изменении пароля: ' + (err.response?.data?.detail || err.message));
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
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom
          sx={{ fontSize: isMobile ? '1.25rem' : '2rem' }}
        >
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Настройки безопасности
        </Typography>
      </Grid>
      
      {success && (
        <Grid item xs={12}>
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Grid>
      )}
      
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}
      
      {/* Двухфакторная аутентификация */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Двухфакторная аутентификация
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings?.two_factor_enabled || false}
                    onChange={() => {
                      if (securitySettings?.two_factor_enabled) {
                        handleDisable2FA();
                      } else {
                        handleEnable2FA();
                      }
                    }}
                  />
                }
                label={securitySettings?.two_factor_enabled ? 'Включена' : 'Выключена'}
              />
              
              {securitySettings?.two_factor_enabled && (
                <Chip 
                  icon={<VerifiedIcon />} 
                  label="2FA активна" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            
            <Typography variant="body2" color="textSecondary">
              Двухфакторная аутентификация добавляет дополнительный уровень безопасности 
              к вашей учетной записи. При включении 2FA вам нужно будет вводить код 
              из приложения аутентификации при каждом входе в систему.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Смена пароля */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Смена пароля
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Текущий пароль"
                  name="old_password"
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    old_password: e.target.value
                  })}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Новый пароль"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    new_password: e.target.value
                  })}
                  size={isMobile ? "small" : "medium"}
                  helperText={`Минимум ${securitySettings?.min_password_length || 8} символов`}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Подтвердите новый пароль"
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirm_password: e.target.value
                  })}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<LockIcon />}
                  onClick={handleChangePassword}
                  disabled={saving}
                  size={isMobile ? "small" : "medium"}
                >
                  {saving ? 'Изменение...' : 'Изменить пароль'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Информация о безопасности */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Информация о безопасности
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                      Последняя смена пароля
                    </Typography>
                    <Typography variant="h6">
                      {securitySettings?.password_changed_at 
                        ? new Date(securitySettings.password_changed_at).toLocaleDateString('ru-RU')
                        : 'Никогда'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                      Мин. длина пароля
                    </Typography>
                    <Typography variant="h6">
                      {securitySettings?.min_password_length || 8} символов
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                      Требования к паролю
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {securitySettings?.require_uppercase && (
                        <Chip label="Заглавные" size="small" sx={{ m: 0.25 }} />
                      )}
                      {securitySettings?.require_lowercase && (
                        <Chip label="Строчные" size="small" sx={{ m: 0.25 }} />
                      )}
                      {securitySettings?.require_numbers && (
                        <Chip label="Цифры" size="small" sx={{ m: 0.25 }} />
                      )}
                      {securitySettings?.require_special_chars && (
                        <Chip label="Символы" size="small" sx={{ m: 0.25 }} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                      Срок действия пароля
                    </Typography>
                    <Typography variant="h6">
                      {securitySettings?.password_expiry_days || 90} дней
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Диалог включения 2FA */}
      <Dialog 
        open={open2FADialog} 
        onClose={() => setOpen2FADialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Настройка двухфакторной аутентификации
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Отсканируйте QR код в вашем приложении аутентификации
            </Typography>
            
            {qrCodeData && (
              <Box sx={{ my: 2 }}>
                <img 
                  src={`data:image/png;base64,${qrCodeData}`} 
                  alt="QR Code" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            )}
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Или введите секретный ключ вручную:
            </Typography>
            
            <Box sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 1, 
              borderRadius: 1, 
              mb: 2,
              fontFamily: 'monospace'
            }}>
              {secretKey}
            </Box>
            
            <TextField
              fullWidth
              label="Введите 6-значный код"
              value={twoFAToken}
              onChange={(e) => setTwoFAToken(e.target.value)}
              inputProps={{ maxLength: 6 }}
              sx={{ mt: 2 }}
              size={isMobile ? "small" : "medium"}
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
            onClick={() => setOpen2FADialog(false)}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleVerify2FA}
            variant="contained"
            disabled={!twoFAToken || twoFAToken.length !== 6}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default SecuritySettings;