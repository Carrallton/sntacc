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
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { paymentService } from '../../services/payments';
import { plotService } from '../../services/plots';
import PaymentForm from './PaymentForm';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, payment: null });

  useEffect(() => {
    fetchPayments();
    fetchPlots();
  }, [selectedYear]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getByYear(selectedYear);
      setPayments(response.data);
    } catch (err) {
      setError('Ошибка при загрузке платежей: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlots = async () => {
    try {
      const response = await plotService.getAll();
      setPlots(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке участков:', err);
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setOpenForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setOpenForm(true);
  };

  const handleDeletePayment = (payment) => {
    setDeleteDialog({ open: true, payment });
  };

  const confirmDelete = async () => {
    try {
      await paymentService.delete(deleteDialog.payment.id);
      fetchPayments();
      setDeleteDialog({ open: false, payment: null });
    } catch (err) {
      setError('Ошибка при удалении платежа: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchPayments();
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
            Платежи
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPayment}
          >
            Добавить платеж
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
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
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Участок</TableCell>
                    <TableCell>Год</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Дата оплаты</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.plot?.plot_number} - {payment.plot?.address}
                      </TableCell>
                      <TableCell>{payment.year}</TableCell>
                      <TableCell>{payment.amount} руб.</TableCell>
                      <TableCell>
                        {payment.date_paid ? new Date(payment.date_paid).toLocaleDateString('ru-RU') : 'Не указана'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(payment.status)} 
                          color={getStatusColor(payment.status)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditPayment(payment)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeletePayment(payment)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Форма платежа */}
      <PaymentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        payment={editingPayment}
        onSuccess={handleFormSuccess}
        plots={plots}
        year={selectedYear}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, payment: null })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить платеж за {deleteDialog.payment?.year} год 
          по участку {deleteDialog.payment?.plot?.plot_number}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, payment: null })}>
            Отмена
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PaymentList;