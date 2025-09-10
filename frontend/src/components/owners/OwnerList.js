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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useMediaQuery,
  Box,
  TextField,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { ownerService } from '../../services/owners';
import OwnerForm from './OwnerForm';

const OwnerList = () => {
  const [owners, setOwners] = useState([]);
  const [allOwners, setAllOwners] = useState([]); // Для фильтрации
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, owner: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    fullName: '',
    phone: '',
    email: '',
    plotNumber: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await ownerService.getAll();
      setOwners(response.data);
      setAllOwners(response.data);
    } catch (err) {
      setError('Ошибка при загрузке собственников: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = [...allOwners];
    
    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(owner =>
        owner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (owner.phone && owner.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (owner.email && owner.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Фильтры
    if (filters.fullName) {
      filtered = filtered.filter(owner =>
        owner.full_name.toLowerCase().includes(filters.fullName.toLowerCase())
      );
    }
    
    if (filters.phone) {
      filtered = filtered.filter(owner =>
        owner.phone && owner.phone.toLowerCase().includes(filters.phone.toLowerCase())
      );
    }
    
    if (filters.email) {
      filtered = filtered.filter(owner =>
        owner.email && owner.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    if (filters.plotNumber) {
      filtered = filtered.filter(owner =>
        owner.plots_history && owner.plots_history.some(plotHistory =>
          plotHistory.plot.plot_number.toLowerCase().includes(filters.plotNumber.toLowerCase())
        )
      );
    }
    
    setOwners(filtered);
  }, [searchQuery, filters, allOwners]);

  const handleAddOwner = () => {
    setEditingOwner(null);
    setOpenForm(true);
  };

  const handleEditOwner = (owner) => {
    setEditingOwner(owner);
    setOpenForm(true);
  };

  const handleDeleteOwner = (owner) => {
    setDeleteDialog({ open: true, owner });
  };

  const confirmDelete = async () => {
    try {
      await ownerService.delete(deleteDialog.owner.id);
      fetchOwners();
      setDeleteDialog({ open: false, owner: null });
    } catch (err) {
      setError('Ошибка при удалении собственника: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchOwners();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      fullName: '',
      phone: '',
      email: '',
      plotNumber: '',
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
              Собственники
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddOwner}
            >
              Добавить
            </Button>
          </Box>
          
          {/* Поиск и фильтры */}
          <Box sx={{ mb: 2, px: 1 }}>
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
                  label="ФИО"
                  value={filters.fullName}
                  onChange={(e) => handleFilterChange('fullName', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Телефон"
                  value={filters.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Номер участка"
                  value={filters.plotNumber}
                  onChange={(e) => handleFilterChange('plotNumber', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  size="small"
                >
                  Сбросить фильтры
                </Button>
              </Box>
            </Collapse>
          </Box>
        </Grid>
        
        {owners.map((owner) => (
          <Grid item xs={12} key={owner.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      {owner.full_name}
                    </Typography>
                    {owner.phone && (
                      <Typography variant="body2" color="textSecondary">
                        {owner.phone}
                      </Typography>
                    )}
                    {owner.email && (
                      <Typography variant="body2" color="textSecondary">
                        {owner.email}
                      </Typography>
                    )}
                    {owner.plots_history && owner.plots_history.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          Участки: {owner.plots_history.length}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditOwner(owner)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteOwner(owner)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {owners.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                Собственники не найдены
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Формы и диалоги */}
        <OwnerForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          owner={editingOwner}
          onSuccess={handleFormSuccess}
        />

        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, owner: null })}
        >
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            Вы уверены, что хотите удалить собственника {deleteDialog.owner?.full_name}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, owner: null })}>
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
            Собственники
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddOwner}
          >
            Добавить собственника
          </Button>
        </Box>
        
        {/* Поиск и фильтры */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Поиск"
                placeholder="ФИО, телефон, email..."
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
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="ФИО"
                    value={filters.fullName}
                    onChange={(e) => handleFilterChange('fullName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Телефон"
                    value={filters.phone}
                    onChange={(e) => handleFilterChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={filters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Номер участка"
                    value={filters.plotNumber}
                    onChange={(e) => handleFilterChange('plotNumber', e.target.value)}
                  />
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
                    <TableCell>ФИО</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Количество участков</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {owners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {owner.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {owner.phone || '—'}
                      </TableCell>
                      <TableCell>
                        {owner.email || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={owner.plots_history?.length || 0} 
                          color="primary" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditOwner(owner)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteOwner(owner)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {owners.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  Собственники не найдены
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Формы и диалоги */}
      <OwnerForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        owner={editingOwner}
        onSuccess={handleFormSuccess}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, owner: null })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить собственника {deleteDialog.owner?.full_name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, owner: null })}>
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

export default OwnerList;