// frontend/src/components/profile/Profile.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { authService } from '../../services/auth';

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [password, setPassword] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [securitySettings, setSecuritySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [open2FADialog, setOpen2FADialog] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');

  // Загружаем профиль пользователя и настройки безопасности
  useEffect(() => {
    fetchProfile();
    fetchSecuritySettings();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setProfile({
        username: response.data.username || '',
        email: response.data.email || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
      });
    } catch (err) {
      setError('Ошибка при загрузке профиля: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      const response = await authService.getSecuritySettings();
      setSecuritySettings(response);
    } catch (err) {
      console.error('Ошибка при загрузке настроек безопасности:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await authService.updateProfile(profile);
      setSuccess('Профиль успешно обновлен');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при сохранении профиля: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (password.new_password !== password.confirm_password) {
      setError('Новые пароли не совпадают');
      return;
    }
    
    if (password.new_password.length < (securitySettings?.min_password_length || 8)) {
      setError(`Пароль должен содержать минимум ${securitySettings?.min_password_length || 8} символов`);
      return;
    }
    
    if (!password.old_password) {
      setError('Введите текущий пароль');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await authService.changePassword({
        old_password: password.old_password,
        new_password: password.new_password,
        confirm_password: password.confirm_password
      });
      setSuccess('Пароль успешно изменен');
      setPassword({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при изменении пароля: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <CircularProgress />
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
          Профиль пользователя
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
      
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: isMobile ? 1 : 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{ 
                minHeight: isMobile ? 36 : 48,
                mb: 2,
                '& .MuiTab-root': {
                  minHeight: isMobile ? 36 : 48,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  py: isMobile ? 0.5 : 1,
                  px: isMobile ? 1 : 2
                }
              }}
            >
              <Tab label="Основная информация" icon={<AccountIcon />} />
              <Tab label="Безопасность" icon={<SecurityIcon />} />
            </Tabs>
            
            {/* Основная информация */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                    <Avatar
                      sx={{ 
                        width: isMobile ? 80 : 100, 
                        height: isMobile ? 80 : 100, 
                        mx: 'auto', 
                        mb: 2, 
                        bgcolor: 'primary.main' 
                      }}
                    >
                      <AccountIcon sx={{ fontSize: isMobile ? 40 : 60 }} />
                    </Avatar>
                    <Typography variant={isMobile ? "h6" : "h5"}>
                      {profile.first_name} {profile.last_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      @{profile.username}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.email}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Имя пользователя"
                      name="username"
                      value={profile.username}
                      onChange={handleProfileChange}
                      disabled
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Имя"
                      name="first_name"
                      value={profile.first_name}
                      onChange={handleProfileChange}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Фамилия"
                      name="last_name"
                      value={profile.last_name}
                      onChange={handleProfileChange}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Телефон"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      size={isMobile ? "small" : "medium"}
                    >
                      {saving ? 'Сохранение...' : 'Сохранить профиль'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Безопасность */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                {/* Двухфакторная аутентификация */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LockIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Двухфакторная аутентификация
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ flexGrow: 1 }}>
                          Статус: {securitySettings?.two_factor_enabled ? 'Включена' : 'Выключена'}
                        </Typography>
                        {securitySettings?.two_factor_enabled && (
                          <Chip 
                            icon={<VerifiedIcon />} 
                            label="Активна" 
                            color="success" 
                            size="small" 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Двухфакторная аутентификация добавляет дополнительный уровень 
                        безопасности к вашей учетной записи.
                      </Typography>
                      
                      <Button
                        variant={securitySettings?.two_factor_enabled ? "outlined" : "contained"}
                        color={securitySettings?.two_factor_enabled ? "error" : "primary"}
                        onClick={securitySettings?.two_factor_enabled ? handleDisable2FA : handleEnable2FA}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                      >
                        {securitySettings?.two_factor_enabled ? 'Отключить 2FA' : 'Включить 2FA'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Смена пароля */}
                <Card variant="outlined">
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
                          value={password.old_password}
                          onChange={handlePasswordChange}
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Новый пароль"
                          name="new_password"
                          type="password"
                          value={password.new_password}
                          onChange={handlePasswordChange}
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
                          value={password.confirm_password}
                          onChange={handlePasswordChange}
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
                          fullWidth={isMobile}
                        >
                          {saving ? 'Изменение...' : 'Изменить пароль'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* Информация о безопасности */}
                {securitySettings && (
                  <Card variant="outlined" sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Информация о безопасности
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Последняя смена пароля:
                          </Typography>
                          <Typography variant="body1">
                            {securitySettings.password_changed_at 
                              ? new Date(securitySettings.password_changed_at).toLocaleDateString('ru-RU')
                              : 'Никогда'
                            }
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Минимальная длина пароля:
                          </Typography>
                          <Typography variant="body1">
                            {securitySettings.min_password_length} символов
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Требования к паролю:
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {securitySettings.require_uppercase && (
                              <Chip label="Заглавные буквы" size="small" sx={{ m: 0.25 }} />
                            )}
                            {securitySettings.require_lowercase && (
                              <Chip label="Строчные буквы" size="small" sx={{ m: 0.25 }} />
                            )}
                            {securitySettings.require_numbers && (
                              <Chip label="Цифры" size="small" sx={{ m: 0.25 }} />
                            )}
                            {securitySettings.require_special_chars && (
                              <Chip label="Специальные символы" size="small" sx={{ m: 0.25 }} />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
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
              fontFamily: 'monospace',
              fontSize: '0.875rem'
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

export default Profile;