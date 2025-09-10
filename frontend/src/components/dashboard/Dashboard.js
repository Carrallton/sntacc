import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { paymentService } from '../../services/payments';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getStatistics(new Date().getFullYear());
        setStats(response.data);
      } catch (err) {
        setError('Ошибка при загрузке статистики');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
          sx={{ 
            fontSize: isMobile ? '1.25rem' : '2rem',
            px: isMobile ? 1 : 0
          }}
        >
          Панель управления
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: isMobile ? '0.875rem' : 'inherit' }}
            >
              Всего участков
            </Typography>
            <Typography 
              variant={isMobile ? "h4" : "h3"}
              sx={{ fontSize: isMobile ? '1.5rem' : '3rem' }}
            >
              {stats?.total_plots || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: isMobile ? '0.875rem' : 'inherit' }}
            >
              Оплачено
            </Typography>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              color="success.main"
              sx={{ fontSize: isMobile ? '1.5rem' : '3rem' }}
            >
              {stats?.paid || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: isMobile ? '0.875rem' : 'inherit' }}
            >
              Процент оплаты
            </Typography>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              color="primary.main"
              sx={{ fontSize: isMobile ? '1.5rem' : '3rem' }}
            >
              {stats?.payment_rate || 0}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;