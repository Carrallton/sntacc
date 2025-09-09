import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import { reportService } from '../../services/reports';
import { paymentService } from '../../services/payments';

const PaymentReport = () => {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReportData();
  }, [selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем платежи
      const paymentsResponse = await paymentService.getByYear(selectedYear);
      setPayments(paymentsResponse.data);
      
      // Получаем статистику
      const statsResponse = await reportService.getPaymentStatistics(selectedYear);
      setStatistics(statsResponse.data);
      
    } catch (err) {
      setError('Ошибка при загрузке данных отчета: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Здесь будет реализация экспорта в Excel
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация
      alert('Отчет экспортирован в Excel');
    } catch (err) {
      setError('Ошибка при экспорте в Excel: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Здесь будет реализация экспорта в PDF
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация
      alert('Отчет экспортирован в PDF');
    } catch (err) {
      setError('Ошибка при экспорте в PDF: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'not_paid': return 'error';
      case 'partial': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'not_paid': return 'Не оплачен';
      case 'partial': return 'Частично';
      default: return status;
    }
  };

  // Генерируем список лет для фильтра
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

  // Рассчитываем общую сумму
  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

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
            Отчет по платежам
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
            
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={exportToExcel}
              disabled={exporting}
            >
              {exporting ? 'Экспорт...' : 'Excel'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={exportToPDF}
              disabled={exporting}
            >
              {exporting ? 'Экспорт...' : 'PDF'}
            </Button>
          </Box>
        </Box>
      </Grid>
      
      {/* Статистика */}
      {statistics && (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Всего участков
                  </Typography>
                  <Typography variant="h5">
                    {statistics.total_plots}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Оплачено
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {statistics.paid}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Не оплачено
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {statistics.not_paid}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Процент оплаты
                  </Typography>
                  <Typography variant="h5" color="primary.main">
                    {statistics.payment_rate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}
      
      {/* Таблица платежей */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Платежи за {selectedYear} год
              </Typography>
              <Typography variant="subtitle1">
                Общая сумма: <strong>{totalAmount.toFixed(2)} руб.</strong>
              </Typography>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Участок</TableCell>
                    <TableCell>Владелец</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Дата оплаты</TableCell>
                    <TableCell>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.plot?.plot_number}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {payment.plot?.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {payment.plot?.current_owner ? (
                          <Typography variant="body2">
                            {payment.plot.current_owner.full_name}
                          </Typography>
                        ) : (
                          <Chip label="Нет владельца" size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {parseFloat(payment.amount).toFixed(2)} руб.
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {payment.date_paid 
                          ? new Date(payment.date_paid).toLocaleDateString('ru-RU')
                          : 'Не указана'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(payment.status)} 
                          color={getStatusColor(payment.status)} 
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentReport;