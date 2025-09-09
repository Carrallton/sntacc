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
  Box,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { plotService } from '../../services/plots';
import PlotForm from './PlotForm';

const PlotList = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, plot: null });

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Начинаем загрузку участков...');
        const response = await plotService.getAll();
        console.log('Получены данные:', response.data);
        setPlots(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке:', err);
        setError('Ошибка при загрузке участков: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const response = await plotService.getAll();
      setPlots(response.data);
    } catch (err) {
      setError('Ошибка при загрузке участков');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const confirmDelete = async () => {
    try {
      await plotService.delete(deleteDialog.plot.id);
      fetchPlots();
      setDeleteDialog({ open: false, plot: null });
    } catch (err) {
      setError('Ошибка при удалении участка');
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchPlots();
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
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
                      <TableCell>{plot.current_owner ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={plot.current_owner.full_name} 
                            color="primary" 
                            size="small"
                            sx={{ maxWidth: '200px' }}/>
                            {plot.current_owner.phone && (
                            <Typography variant="caption" color="text.secondary">
                              ({plot.current_owner.phone})
                            </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Chip 
                                  label="Нет владельца" 
                                  color="default" 
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditPlot(plot)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeletePlot(plot)}
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

      {/* Форма участка */}
      <PlotForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        plot={editingPlot}
        onSuccess={handleFormSuccess}
      />

      {/* Диалог подтверждения удаления */}
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
    </Grid>
  );
};

export default PlotList;