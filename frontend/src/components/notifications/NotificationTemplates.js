import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  MenuItem, 
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Напоминание об оплате',
      type: 'email',
      subject: 'Напоминание об оплате членских взносов СНТ',
      body: 'Уважаемый(ая) {{owner_name}}!\n\nНапоминаем, что необходимо оплатить членские взносы за {{year}} год по участку №{{plot_number}}.\nСумма к оплате: {{amount}} руб.\n\nС уважением,\nПравление СНТ',
    },
    {
      id: 2,
      name: 'Telegram напоминание',
      type: 'telegram',
      subject: '',
      body: 'Здравствуйте, {{owner_name}}!\n\nНапоминаем об оплате членских взносов за {{year}} год по участку №{{plot_number}}.\nСумма: {{amount}} руб.\n\nСНТ "Название"',
    }
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    subject: '',
    body: '',
  });
  const [error, setError] = useState('');

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        subject: template.subject,
        body: template.body,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        type: 'email',
        subject: '',
        body: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.body) {
      setError('Заполните обязательные поля');
      return;
    }

    if (editingTemplate) {
      // Редактирование существующего шаблона
      setTemplates(prev => 
        prev.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, ...formData }
            : t
        )
      );
    } else {
      // Создание нового шаблона
      const newTemplate = {
        id: Date.now(),
        ...formData,
      };
      setTemplates(prev => [...prev, newTemplate]);
    }

    handleCloseDialog();
  };

  const handleDelete = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <EmailIcon fontSize="small" />;
      case 'telegram': return <TelegramIcon fontSize="small" />;
      default: return null;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email': return 'primary';
      case 'telegram': return 'info';
      default: return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Шаблоны уведомлений
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить шаблон
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Тема</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {template.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getTypeIcon(template.type)}
                          label={template.type === 'email' ? 'Email' : 'Telegram'}
                          color={getTypeColor(template.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {template.subject || 'Без темы'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(template)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(template.id)}
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

      {/* Диалог редактирования шаблона */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Редактировать шаблон' : 'Добавить шаблон'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              label="Название шаблона"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              select
              label="Тип уведомления"
              name="type"
              value={formData.type}
              onChange={handleChange}
              margin="normal"
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="telegram">Telegram</MenuItem>
            </TextField>
            
            {formData.type === 'email' && (
              <TextField
                fullWidth
                label="Тема письма"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                margin="normal"
              />
            )}
            
            <TextField
              fullWidth
              label="Текст сообщения"
              name="body"
              value={formData.body}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={8}
              required
              helperText="Доступные переменные: {{owner_name}}, {{plot_number}}, {{year}}, {{amount}}"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default NotificationTemplates;