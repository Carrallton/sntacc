// frontend/src/components/plots/AddOwnerForm.js
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
  useMediaQuery,
} from '@mui/material';
import { ownerService } from '../../services/owners';
import { plotService } from '../../services/plots';

const AddOwnerForm = ({ open, onClose, plot, onSuccess }) => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [ownershipStart, setOwnershipStart] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (open) {
      fetchOwners();
      // Устанавливаем сегодняшнюю дату по умолчанию
      const today = new Date().toISOString().split('T')[0];
      setOwnershipStart(today);
    }
  }, [open]);

  const fetchOwners = async () => {
    try {
      const response = await ownerService.getAll();
      setOwners(response.data);
    } catch (err) {
      setError('Ошибка при загрузке собственников');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOwner || !ownershipStart) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await plotService.addOwner(plot.id, {
        owner_id: selectedOwner,
        ownership_start: ownershipStart
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Ошибка при добавлении владельца: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Сброс значений при закрытии
    setSelectedOwner('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Добавить владельца участка {plot?.plot_number}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: isMobile ? 0 : 2,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 1 : 2
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.875rem' : 'inherit'
              }}
            >
              {error}
            </Alert>
          )}
          
          <FormControl 
            fullWidth 
            margin="normal"
            size={isMobile ? "small" : "medium"}
            sx={{ mt: isMobile ? 0 : 2 }}
          >
            <InputLabel 
              sx={{ 
                fontSize: isMobile ? '0.875rem' : 'inherit' 
              }}
            >
              Выберите собственника
            </InputLabel>
            <Select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              label="Выберите собственника"
              size={isMobile ? "small" : "medium"}
            >
              {owners.map((owner) => (
                <MenuItem 
                  key={owner.id} 
                  value={owner.id}
                  sx={{ 
                    fontSize: isMobile ? '0.875rem' : 'inherit',
                    py: isMobile ? 0.5 : 1
                  }}
                >
                  {owner.full_name} 
                  {owner.phone && ` (${owner.phone})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Дата начала владения"
            type="date"
            value={ownershipStart}
            onChange={(e) => setOwnershipStart(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mt: isMobile ? 0 : 2,
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : 'inherit'
              }
            }}
          />
          
          {plot?.current_owner && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                Текущий владелец: <strong>{plot.current_owner.full_name}</strong>
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem', mt: 0.5 }}
              >
                При добавлении нового владельца предыдущее владение будет завершено
              </Typography>
            </Alert>
          )}
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
          onClick={handleClose}
          sx={{ 
            fontSize: isMobile ? '0.875rem' : 'inherit',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !selectedOwner || !ownershipStart}
          sx={{ 
            fontSize: isMobile ? '0.875rem' : 'inherit',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          {loading ? 'Сохранение...' : 'Добавить владельца'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOwnerForm;