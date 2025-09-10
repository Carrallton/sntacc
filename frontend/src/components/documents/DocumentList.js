import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  TextSnippet as TextIcon,
} from '@mui/icons-material';
import { documentService } from '../../services/documents';
import DocumentForm from './DocumentForm';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, document: null });
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    documentType: '',
    status: '',
    tag: '',
  });
  const [statistics, setStatistics] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
    fetchTags();
    fetchStatistics();
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments();
      setDocuments(response.data);
      setAllDocuments(response.data);
    } catch (err) {
      setError('Ошибка при загрузке документов: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await documentService.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await documentService.getTags();
      setTags(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке тегов:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await documentService.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  };

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = [...allDocuments];
    
    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(document =>
        document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (document.description && document.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (document.tags && document.tags.some(tag => 
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    // Фильтры
    if (filters.category) {
      filtered = filtered.filter(document => 
        document.category && document.category.id.toString() === filters.category
      );
    }
    
    if (filters.documentType) {
      filtered = filtered.filter(document => document.document_type === filters.documentType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(document => document.status === filters.status);
    }
    
    if (filters.tag) {
      filtered = filtered.filter(document => 
        document.tags && document.tags.some(tag => tag.id.toString() === filters.tag)
      );
    }
    
    setDocuments(filtered);
  }, [searchQuery, filters, allDocuments]);

  const handleAddDocument = () => {
    setEditingDocument({
      title: '',
      description: '',
      category: '',
      document_type: 'other',
      file: null,
      status: 'active',
      related_plot: '',
      related_owner: '',
      tags: [],
    });
    setOpenForm(true);
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setOpenForm(true);
  };

  const handleDeleteDocument = (document) => {
    setDeleteDialog({ open: true, document });
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Ошибка при скачивании документа: ' + (err.response?.data?.detail || err.message));
    }
  };

  const confirmDelete = async () => {
    try {
      await documentService.deleteDocument(deleteDialog.document.id);
      fetchDocuments();
      setDeleteDialog({ open: false, document: null });
    } catch (err) {
      setError('Ошибка при удалении документа: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchDocuments();
    fetchStatistics();
  };

  const getFileIcon = (document) => {
    const ext = document.file_extension || '';
    switch (ext) {
      case '.pdf':
        return <PdfIcon sx={{ color: '#f44336' }} />;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        return <ImageIcon sx={{ color: '#4caf50' }} />;
      case '.doc':
      case '.docx':
        return <DocIcon sx={{ color: '#2196f3' }} />;
      case '.xls':
      case '.xlsx':
        return <ExcelIcon sx={{ color: '#4caf50' }} />;
      case '.txt':
        return <TextIcon sx={{ color: '#9e9e9e' }} />;
      default:
        return <FileIcon sx={{ color: '#757575' }} />;
    }
  };

  const getFileTypeText = (type) => {
    switch (type) {
      case 'receipt': return 'Квитанция';
      case 'contract': return 'Договор';
      case 'protocol': return 'Протокол';
      case 'resolution': return 'Решение';
      case 'invoice': return 'Счет';
      case 'act': return 'Акт';
      case 'other': return 'Другое';
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'active': return 'success';
      case 'archived': return 'warning';
      case 'deleted': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'active': return 'Активный';
      case 'archived': return 'В архиве';
      case 'deleted': return 'Удален';
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
      category: '',
      documentType: '',
      status: '',
      tag: '',
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

  return (
    <Grid container spacing={isMobile ? 1 : 3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom
            sx={{ fontSize: isMobile ? '1.25rem' : '2rem' }}
          >
            <FileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Документооборот
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDocument}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? 'Добавить' : 'Добавить документ'}
          </Button>
        </Box>
      </Grid>
      
      {/* Статистика */}
      {statistics && (
        <Grid item xs={12}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Всего документов
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    За 30 дней
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="primary.main"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.recent}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Популярная категория
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.by_category?.[0]?.category__name || '—'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem' }}
                  >
                    {statistics.by_category?.[0]?.count || 0} документов
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
                  <Typography 
                    color="textSecondary" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Активные
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    color="success.main"
                    sx={{ fontSize: isMobile ? '1.125rem' : '1.5rem' }}
                  >
                    {statistics.by_status?.find(s => s.status === 'active')?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: isMobile ? 1 : 2 }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Поиск"
                  placeholder="Название, описание, теги..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, fontSize: isMobile ? '1rem' : '1.25rem' }} />,
                  }}
                  size={isMobile ? "small" : "medium"}
                  sx={{ minWidth: isMobile ? '100%' : 200 }}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  size={isMobile ? "small" : "medium"}
                >
                  Фильтры
                </Button>
                
                {(searchQuery || Object.values(filters).some(v => v)) && (
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    size={isMobile ? "small" : "medium"}
                  >
                    Сбросить
                  </Button>
                )}
              </Box>
              
              {showFilters && (
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Категория</InputLabel>
                      <Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        label="Категория"
                      >
                        <MenuItem value="">Все</MenuItem>
                        {categories.map(category => (
                          <MenuItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Тип документа</InputLabel>
                      <Select
                        value={filters.documentType}
                        onChange={(e) => handleFilterChange('documentType', e.target.value)}
                        label="Тип документа"
                      >
                        <MenuItem value="">Все</MenuItem>
                        <MenuItem value="receipt">Квитанция</MenuItem>
                        <MenuItem value="contract">Договор</MenuItem>
                        <MenuItem value="protocol">Протокол</MenuItem>
                        <MenuItem value="resolution">Решение</MenuItem>
                        <MenuItem value="invoice">Счет</MenuItem>
                        <MenuItem value="act">Акт</MenuItem>
                        <MenuItem value="other">Другое</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Статус</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        label="Статус"
                      >
                        <MenuItem value="">Все</MenuItem>
                        <MenuItem value="draft">Черновик</MenuItem>
                        <MenuItem value="active">Активный</MenuItem>
                        <MenuItem value="archived">В архиве</MenuItem>
                        <MenuItem value="deleted">Удален</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Тег</InputLabel>
                      <Select
                        value={filters.tag}
                        onChange={(e) => handleFilterChange('tag', e.target.value)}
                        label="Тег"
                      >
                        <MenuItem value="">Все</MenuItem>
                        {tags.map(tag => (
                          <MenuItem key={tag.id} value={tag.id.toString()}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  backgroundColor: tag.color,
                                  borderRadius: '50%'
                                }} 
                              />
                              {tag.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </Box>
            
            <TableContainer component={Paper}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Документ
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Категория
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Тип
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Размер
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Статус
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Дата
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Действия
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow 
                      key={document.id} 
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                            {getFileIcon(document)}
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="body2" 
                              fontWeight="medium"
                              sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                            >
                              {document.title}
                            </Typography>
                            {document.description && (
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ fontSize: isMobile ? '0.625rem' : '0.75rem', display: 'block' }}
                              >
                                {document.description.substring(0, 50)}{document.description.length > 50 ? '...' : ''}
                              </Typography>
                            )}
                            {document.tags && document.tags.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                {document.tags.slice(0, 3).map(tag => (
                                  <Chip
                                    key={tag.id}
                                    label={tag.name}
                                    size="small"
                                    sx={{ 
                                      height: 16,
                                      fontSize: isMobile ? '0.5rem' : '0.625rem',
                                      '& .MuiChip-label': {
                                        px: 0.5
                                      }
                                    }}
                                  />
                                ))}
                                {document.tags.length > 3 && (
                                  <Chip
                                    label={`+${document.tags.length - 3}`}
                                    size="small"
                                    sx={{ 
                                      height: 16,
                                      fontSize: isMobile ? '0.5rem' : '0.625rem',
                                      '& .MuiChip-label': {
                                        px: 0.5
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        {document.category ? (
                          <Chip 
                            label={document.category.name} 
                            size="small"
                            sx={{ 
                              fontSize: isMobile ? '0.625rem' : '0.75rem',
                              height: isMobile ? 20 : 24
                            }}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        <Chip 
                          label={getFileTypeText(document.document_type)} 
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: isMobile ? '0.625rem' : '0.75rem',
                            height: isMobile ? 20 : 24
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          {document.file_size_mb} МБ
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        <Chip 
                          label={getStatusText(document.status)} 
                          color={getStatusColor(document.status)} 
                          size="small"
                          sx={{ 
                            fontSize: isMobile ? '0.625rem' : '0.75rem',
                            height: isMobile ? 20 : 24
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          {new Date(document.created_at).toLocaleDateString('ru-RU')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Скачать">
                            <IconButton 
                              size={isMobile ? "small" : "medium"}
                              onClick={() => handleDownloadDocument(document.id, document.title)}
                            >
                              <DownloadIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Редактировать">
                            <IconButton 
                              size={isMobile ? "small" : "medium"}
                              onClick={() => handleEditDocument(document)}
                            >
                              <EditIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton 
                              size={isMobile ? "small" : "medium"}
                              onClick={() => handleDeleteDocument(document)}
                              color="error"
                            >
                              <DeleteIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {documents.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  Документы не найдены
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Форма документа */}
      <DocumentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        document={editingDocument}
        onSuccess={handleFormSuccess}
        categories={categories}
        tags={tags}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, document: null })}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Вы уверены, что хотите удалить документ "{deleteDialog.document?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <Button
            onClick={() => setDeleteDialog({ open: false, document: null })}
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained" 
            color="error"
            sx={{ 
              fontSize: isMobile ? '0.875rem' : 'inherit',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default DocumentList;