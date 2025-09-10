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
  useMediaQuery,
  TextField,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { paymentService } from '../../services/payments';
import { plotService } from '../../services/plots';
import PaymentForm from './PaymentForm';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]); // Для фильтрации
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, payment: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    plotNumber: '',
    ownerName: '',
    status: '',
    amountMin: '',
    amountMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Генерируем список лет для фильтра
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i);
  }

  useEffect(() => {
    fetchPayments();
    fetchPlots();
  }, [selectedYear]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getByYear(selectedYear);
      setPayments(response.data);
      setAllPayments(response.data);
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

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = [...allPayments];
    
    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.plot?.plot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.plot?.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.plot?.current_owner && 
         payment.plot.current_owner.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Фильтры
    if (filters.plotNumber) {
      filtered = filtered.filter(payment =>
        payment.plot?.plot_number.toLowerCase().includes(filters.plotNumber.toLowerCase())
      );
    }
    
    if (filters.ownerName) {
      filtered = filtered.filter(payment =>
        payment.plot?.current_owner && 
        payment.plot.current_owner.full_name.toLowerCase().includes(filters.ownerName.toLowerCase())
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }
    
    if (filters.amountMin) {
      filtered = filtered.filter(payment => parseFloat(payment.amount) >= parseFloat(filters.amountMin));
    }
    
    if (filters.amountMax) {
      filtered = filtered.filter(payment => parseFloat(payment.amount) <= parseFloat(filters.amountMax));
    }
    
    setPayments(filtered);
  }, [searchQuery, filters, allPayments]);

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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      plotNumber: '',
      ownerName: '',
      status: '',
      amountMin: '',
      amountMax: '',
    });
    setSearchQuery('');
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

  // Для мобильных устройств используем карточки вместо таблиц
  if (isMobile) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
            <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
              Платежи
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddPayment}
            >
              Добавить
            </Button>
          </Box>
          
          {/* Фильтры по году и поиск */}
          <Box sx={{ mb: 2, px: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <FormControl sx={{ minWidth: 100 }} size="small">
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
            
            <TextField
              fullWidth
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, fontSize: '1rem' }} />,
              }}
              size="small"
              sx={{ mb: 1 }}
            />
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Фильтры
            </Button>
            
            <Collapse in={showFilters}>
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Номер участка"
                  value={filters.plotNumber}
                  onChange={(e) => handleFilterChange('plotNumber', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Владелец"
                  value={filters.ownerName}
                  onChange={(e) => handleFilterChange('ownerName', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Статус"
                  >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="paid">Оплачен</MenuItem>
                    <MenuItem value="not_paid">Не оплачен</MenuItem>
                    <MenuItem value="partial">Частично</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Сумма от"
                    type="number"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="до"
                    type="number"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    size="small"
                  />
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Сбросить фильтры
                </Button>
              </Box>
            </Collapse>
          </Box>
        </Grid>
        
        {payments.map((payment) => (
          <Grid item xs={12} key={payment.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      Участок {payment.plot?.plot_number}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {payment.plot?.address}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>{parseFloat(payment.amount).toFixed(2)} руб.</strong>
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditPayment(payment)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeletePayment(payment)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label={`${payment.year} год`} 
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={getStatusText(payment.status)} 
                    color={getStatusColor(payment.status)} 
                    size="small"
                  />
                </Box>
                
                {payment.date_paid && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Оплачено: {new Date(payment.date_paid).toLocaleDateString('ru-RU')}
                  </Typography>
                )}
                
                {payment.plot?.current_owner && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    Владелец: {payment.plot.current_owner.full_name}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {payments.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                Платежи не найдены
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Формы и диалоги */}
        <PaymentForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          payment={editingPayment}
          onSuccess={handleFormSuccess}
          plots={plots}
          year={selectedYear}
        />

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
  }

  // Для десктопа используем таблицу
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
        
        {/* Фильтры */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
              
              <TextField
                label="Поиск"
                placeholder="Номер участка, владелец..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
                sx={{ minWidth: 250 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Фильтры
              </Button>
              
              {(searchQuery || Object.values(filters).some(v => v)) && (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                >
                  Сбросить
                </Button>
              )}
            </Box>
            
            <Collapse in={showFilters}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Номер участка"
                    value={filters.plotNumber}
                    onChange={(e) => handleFilterChange('plotNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Владелец"
                    value={filters.ownerName}
                    onChange={(e) => handleFilterChange('ownerName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Статус"
                    >
                      <MenuItem value="">Все</MenuItem>
                      <MenuItem value="paid">Оплачен</MenuItem>
                      <MenuItem value="not_paid">Не оплачен</MenuItem>
                      <MenuItem value="partial">Частично</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Сумма от"
                      type="number"
                      value={filters.amountMin}
                      onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                      sx={{ width: '50%' }}
                      InputProps={{
                        inputProps: { step: "0.01" }
                      }}
                    />
                    <TextField
                      label="до"
                      type="number"
                      value={filters.amountMax}
                      onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                      sx={{ width: '50%' }}
                      InputProps={{
                        inputProps: { step: "0.01" }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Участок</TableCell>
                    <TableCell>Владелец</TableCell>
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
            
            {payments.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  Платежи не найдены
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Формы и диалоги */}
      <PaymentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        payment={editingPayment}
        onSuccess={handleFormSuccess}
        plots={plots}
        year={selectedYear}
      />

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