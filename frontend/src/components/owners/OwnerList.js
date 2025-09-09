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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ownerService } from '../../services/owners';
import OwnerForm from './OwnerForm';

const OwnerList = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, owner: null });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await ownerService.getAll();
      setOwners(response.data);
    } catch (err) {
      setError('Ошибка при загрузке собственников');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      setError('Ошибка при удалении собственника');
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchOwners();
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
          Собственники
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddOwner}
        >
          Добавить собственника
        </Button>
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
                      <TableCell>{owner.full_name}</TableCell>
                      <TableCell>{owner.phone}</TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>{owner.plots_history?.length || 0}</TableCell>
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
          </CardContent>
        </Card>
      </Grid>

      {/* Форма собственника */}
      <OwnerForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        owner={editingOwner}
        onSuccess={handleFormSuccess}
      />

      {/* Диалог подтверждения удаления */}
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