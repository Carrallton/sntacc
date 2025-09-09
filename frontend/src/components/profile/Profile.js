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
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Save as SaveIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { authService } from '../../services/auth';

const Profile = () => {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Загружаем профиль пользователя
  useEffect(() => {
    fetchProfile();
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
    
    if (password.new_password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
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
        new_password: password.new_password
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
          Профиль пользователя
        </Typography>
      </Grid>
      
      {success && (
        <Grid item xs={12}>
          <Alert severity="success">{success}</Alert>
        </Grid>
      )}
      
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                <AccountIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6">
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                @{profile.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {profile.email}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Имя пользователя"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  disabled
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
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить профиль'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Изменение пароля
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Текущий пароль"
                  name="old_password"
                  type="password"
                  value={password.old_password}
                  onChange={handlePasswordChange}
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
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<LockIcon />}
                  onClick={handleChangePassword}
                  disabled={saving}
                >
                  {saving ? 'Изменение...' : 'Изменить пароль'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Profile;