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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { plotService } from '../../services/plots';
import PlotForm from './PlotForm';
import AddOwnerForm from './AddOwnerForm';

const PlotList = () => {
  const [plots, setPlots] = useState([]);
  const [allPlots, setAllPlots] = useState([]); // Для фильтрации
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, plot: null });
  const [addOwnerDialog, setAddOwnerDialog] = useState({ open: false, plot: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    plotNumber: '',
    ownerName: '',
    address: '',
    areaMin: '',
    areaMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const response = await plotService.getAll();
      setPlots(response.data);
      setAllPlots(response.data);
    } catch (err) {
      setError('Ошибка при загрузке участков: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = [...allPlots];
    
    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(plot =>
        plot.plot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plot.current_owner && 
         plot.current_owner.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Фильтры
    if (filters.plotNumber) {
      filtered = filtered.filter(plot =>
        plot.plot_number.toLowerCase().includes(filters.plotNumber.toLowerCase())
      );
    }
    
    if (filters.ownerName) {
      filtered = filtered.filter(plot =>
        plot.current_owner && 
        plot.current_owner.full_name.toLowerCase().includes(filters.ownerName.toLowerCase())
      );
    }
    
    if (filters.address) {
      filtered = filtered.filter(plot =>
        plot.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    
    if (filters.areaMin) {
      filtered = filtered.filter(plot => plot.area >= parseFloat(filters.areaMin));
    }
    
    if (filters.areaMax) {
      filtered = filtered.filter(plot => plot.area <= parseFloat(filters.areaMax));
    }
    
    setPlots(filtered);
  }, [searchQuery, filters, allPlots]);

  const handleAddPlot = () => {
    setEditingPlot(null);
    setOpenForm(true);
  };

  const handleEditPlot = (plot) => {
    setEditingPlot(plot);
    setOpenForm(true);
  };

  const handleDeletePlot = (plot) => {
    setDeleteDialog({ open: true, plot });
  };

  const handleAddOwner = (plot) => {
    setAddOwnerDialog({ open: true, plot });
  };

  const confirmDelete = async () => {
    try {
      await plotService.delete(deleteDialog.plot.id);
      fetchPlots();
      setDeleteDialog({ open: false, plot: null });
    } catch (err) {
      setError('Ошибка при удалении участка: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchPlots();
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
      address: '',
      areaMin: '',
      areaMax: '',
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
              Участки
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddPlot}
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
                <TextField
                  fullWidth
                  label="Адрес"
                  value={filters.address}
                  onChange={(e) => handleFilterChange('address', e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Площадь от"
                    type="number"
                    value={filters.areaMin}
                    onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="до"
                    type="number"
                    value={filters.areaMax}
                    onChange={(e) => handleFilterChange('areaMax', e.target.value)}
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
        
        {plots.map((plot) => (
          <Grid item xs={12} key={plot.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      Участок {plot.plot_number}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {plot.address}
                    </Typography>
                    {plot.area && (
                      <Typography variant="body2" color="textSecondary">
                        {plot.area} соток
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleAddOwner(plot)}>
                      <PersonAddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditPlot(plot)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeletePlot(plot)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {plot.current_owner && (
                  <Chip 
                    label={plot.current_owner.full_name} 
                    color="primary" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {plots.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                Участки не найдены
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Формы и диалоги остаются такими же */}
        <PlotForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          plot={editingPlot}
          onSuccess={handleFormSuccess}
        />

        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, plot: null })}
        >
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            Вы уверены, что хотите удалить участок {deleteDialog.plot?.plot_number}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, plot: null })}>
              Отмена
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>

        <AddOwnerForm
          open={addOwnerDialog.open}
          onClose={() => setAddOwnerDialog({ open: false, plot: null })}
          plot={addOwnerDialog.plot}
          onSuccess={handleFormSuccess}
        />
      </Grid>
    );
  }

  // Для десктопа используем таблицу
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Участки
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPlot}
          >
            Добавить участок
          </Button>
        </Box>
        
        {/* Поиск и фильтры */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Поиск"
                placeholder="Номер, адрес, владелец..."
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
                    label="Номер участка"
                    value={filters.plotNumber}
                    onChange={(e) => handleFilterChange('plotNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Владелец"
                    value={filters.ownerName}
                    onChange={(e) => handleFilterChange('ownerName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Адрес"
                    value={filters.address}
                    onChange={(e) => handleFilterChange('address', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Площадь от"
                      type="number"
                      value={filters.areaMin}
                      onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                      sx={{ width: '50%' }}
                    />
                    <TextField
                      label="до"
                      type="number"
                      value={filters.areaMax}
                      onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                      sx={{ width: '50%' }}
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
                    <TableCell>Номер</TableCell>
                    <TableCell>Адрес</TableCell>
                    <TableCell>Площадь</TableCell>
                    <TableCell>Текущий владелец</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plots.map((plot) => (
                    <TableRow key={plot.id}>
                      <TableCell>{plot.plot_number}</TableCell>
                      <TableCell>{plot.address}</TableCell>
                      <TableCell>{plot.area} соток</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={plot.current_owner ? plot.current_owner.full_name : 'Нет владельца'} 
                            color={plot.current_owner ? 'primary' : 'default'} 
                            size="small"
                            sx={{ maxWidth: '200px' }}
                          />
                          {plot.current_owner?.phone && (
                            <Typography variant="caption" color="text.secondary">
                              ({plot.current_owner.phone})
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleAddOwner(plot)}
                          title="Добавить владельца"
                        >
                          <PersonAddIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditPlot(plot)}
                          title="Редактировать"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeletePlot(plot)}
                          title="Удалить"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {plots.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  Участки не найдены
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Формы и диалоги */}
      <PlotForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        plot={editingPlot}
        onSuccess={handleFormSuccess}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, plot: null })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить участок {deleteDialog.plot?.plot_number}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, plot: null })}>
            Отмена
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <AddOwnerForm
        open={addOwnerDialog.open}
        onClose={() => setAddOwnerDialog({ open: false, plot: null })}
        plot={addOwnerDialog.plot}
        onSuccess={handleFormSuccess}
      />
    </Grid>
  );
};

export default PlotList;