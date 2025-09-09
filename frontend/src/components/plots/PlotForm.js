import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import { plotService } from '../../services/plots';
import { ownerService } from '../../services/owners';

const PlotForm = ({ open, onClose, plot, onSuccess }) => {
  const [formData, setFormData] = useState({
    plot_number: plot?.plot_number || '',
    address: plot?.address || '',
    area: plot?.area || '',
  });
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [ownershipStart, setOwnershipStart] = useState('');
  const [currentOwner, setCurrentOwner] = useState(null); // Текущий владелец участка
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOwners();
      
      if (plot) {
        // Редактирование существующего участка
        setFormData({
          plot_number: plot.plot_number || '',
          address: plot.address || '',
          area: plot.area || '',
        });
        
        // Устанавливаем текущего владельца
        if (plot.current_owner) {
          setCurrentOwner(plot.current_owner);
          setSelectedOwner(plot.current_owner.id.toString());
        } else {
          setCurrentOwner(null);
          setSelectedOwner('');
        }
        
        // Устанавливаем дату начала владения (если нужно)
        const today = new Date().toISOString().split('T')[0];
        setOwnershipStart(today);
      } else {
        // Создание нового участка
        setFormData({
          plot_number: '',
          address: '',
          area: '',
        });
        setCurrentOwner(null);
        setSelectedOwner('');
        const today = new Date().toISOString().split('T')[0];
        setOwnershipStart(today);
      }
    }
  }, [open, plot]);

  const fetchOwners = async () => {
    try {
      const response = await ownerService.getAll();
      setOwners(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке собственников:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOwnerChange = (e) => {
    const ownerId = e.target.value;
    setSelectedOwner(ownerId);
    
    // Находим выбранного владельца
    if (ownerId) {
      const owner = owners.find(o => o.id.toString() === ownerId);
      if (owner) {
        // Если это новый владелец (не текущий), показываем предупреждение
        if (currentOwner && currentOwner.id.toString() !== ownerId) {
          // Можно добавить логику предупреждения
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let plotData;
      if (plot) {
        // Обновление существующего участка
        const response = await plotService.update(plot.id, formData);
        plotData = response.data;
        
        // Если владелец изменился, добавляем нового владельца
        if (selectedOwner && plotData.id) {
          const selectedOwnerId = parseInt(selectedOwner);
          
          // Если выбран новый владелец или нет текущего владельца
          if (!currentOwner || currentOwner.id !== selectedOwnerId) {
            try {
              await plotService.addOwner(plotData.id, {
                owner_id: selectedOwnerId,
                ownership_start: ownershipStart
              });
            } catch (ownerError) {
              console.error('Ошибка при добавлении владельца:', ownerError);
            }
          }
        }
      } else {
        // Создание нового участка
        const response = await plotService.create(formData);
        plotData = response.data;
        
        // Если выбран владелец, добавляем его
        if (selectedOwner && ownershipStart && plotData.id) {
          try {
            await plotService.addOwner(plotData.id, {
              owner_id: parseInt(selectedOwner),
              ownership_start: ownershipStart
            });
          } catch (ownerError) {
            console.error('Ошибка при добавлении владельца:', ownerError);
          }
        }
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении участка: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {plot ? 'Редактировать участок' : 'Добавить участок'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Номер участка"
                name="plot_number"
                value={formData.plot_number}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                name="address"
                value={formData.address}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Площадь (сотки)"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Выберите собственника</InputLabel>
                <Select
                  value={selectedOwner}
                  onChange={handleOwnerChange}
                  label="Выберите собственника"
                >
                  <MenuItem value="">
                    <em>Нет владельца</em>
                  </MenuItem>
                  {owners.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{owner.full_name}</span>
                        {owner.phone && (
                          <Typography variant="caption" color="text.secondary">
                            ({owner.phone})
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {selectedOwner && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={currentOwner ? "Дата начала нового владения" : "Дата начала владения"}
                  type="date"
                  value={ownershipStart}
                  onChange={(e) => setOwnershipStart(e.target.value)}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText={currentOwner ? "Эта дата завершит предыдущее владение" : ""}
                />
              </Grid>
            )}
            
            {currentOwner && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Текущий владелец: <strong>{currentOwner.full_name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    При выборе нового владельца предыдущее владение будет завершено указанной датой
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlotForm;