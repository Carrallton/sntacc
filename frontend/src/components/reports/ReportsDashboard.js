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
  Tabs,
  Tab,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { reportService } from '../../services/reports';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [reportData, setReportData] = useState({
    template_id: '',
    name: '',
    format: 'json',
    filters: {},
  });
  const [summaryData, setSummaryData] = useState(null);
  const [debtData, setDebtData] = useState(null);
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchTemplates();
    if (activeTab === 0) {
      fetchSummaryData();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReports();
      setReports(response.data);
    } catch (err) {
      setError('Ошибка при загрузке отчетов: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await reportService.getTemplates();
      setTemplates(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке шаблонов:', err);
    }
  };

  const fetchSummaryData = async () => {
    try {
      const response = await reportService.getPaymentSummary();
      setSummaryData(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке сводных данных:', err);
    }
  };

  const fetchDebtData = async () => {
    try {
      const response = await reportService.getDebtReport();
      setDebtData(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных по должникам:', err);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const response = await reportService.getFinancialReport();
      setFinancialData(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке финансовых данных:', err);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const reportName = reportData.name || `Отчет_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
      await reportService.generateReport({
        template_id: reportData.template_id,
        name: reportName,
        format: reportData.format,
        filters: reportData.filters,
      });
      fetchReports();
      setOpenDialog(false);
      setReportData({ template_id: '', name: '', format: 'json', filters: {} });
    } catch (err) {
      setError('Ошибка при генерации отчета: ' + (err.response?.data?.detail || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId, reportName, format) => {
    try {
        const response = await reportService.downloadReport(reportId);
        
        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Определяем расширение файла
        let extension = 'json';
        let mimeType = 'application/json';
        
        switch (format) {
        case 'excel':
            extension = 'xlsx';
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
        case 'csv':
            extension = 'csv';
            mimeType = 'text/csv';
            break;
        case 'pdf':
            extension = 'pdf';
            mimeType = 'application/pdf';
            break;
        }
        
        link.setAttribute('download', `${reportName || 'report'}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Освобождаем память
        window.URL.revokeObjectURL(url);
        
    } catch (err) {
        setError('Ошибка при скачивании отчета: ' + (err.response?.data?.detail || err.message));
    }
    };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отчет?')) {
      try {
        await reportService.deleteReport(reportId);
        fetchReports();
      } catch (err) {
        setError('Ошибка при удалении отчета: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      fetchSummaryData();
    } else if (newValue === 1) {
      fetchDebtData();
    } else if (newValue === 2) {
      fetchFinancialData();
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf': return <AssessmentIcon fontSize="small" />;
      case 'excel': return <BarChartIcon fontSize="small" />;
      case 'csv': return <PieChartIcon fontSize="small" />;
      case 'json': return <ShowChartIcon fontSize="small" />;
      default: return <AssessmentIcon fontSize="small" />;
    }
  };

  const getFormatColor = (format) => {
    switch (format) {
      case 'pdf': return 'error';
      case 'excel': return 'success';
      case 'csv': return 'warning';
      case 'json': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'В ожидании';
      case 'processing': return 'В процессе';
      case 'completed': return 'Завершено';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  if (loading && activeTab === 0) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Отчеты и аналитика
          </Typography>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Сгенерировать отчет
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Сводные данные" icon={<BarChartIcon />} />
              <Tab label="Должники" icon={<PieChartIcon />} />
              <Tab label="Финансы" icon={<ShowChartIcon />} />
              <Tab label="Сгенерированные отчеты" icon={<AssessmentIcon />} />
            </Tabs>
            
            <Box sx={{ mt: 3 }}>
              {activeTab === 0 && (
                <Box>
                  {summaryData && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Всего участков
                            </Typography>
                            <Typography variant="h4">
                              {summaryData.total_plots}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Оплачено
                            </Typography>
                            <Typography variant="h4" color="success.main">
                              {summaryData.paid_plots}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {summaryData.payment_rate}% оплаты
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Не оплачено
                            </Typography>
                            <Typography variant="h4" color="error.main">
                              {summaryData.unpaid_plots}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Собрано средств
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                              {summaryData.total_amount?.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Статистика по статусам
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Количество</TableCell>
                                    <TableCell>Сумма</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(summaryData.by_status || {}).map(([status, data]) => (
                                    <TableRow key={status}>
                                      <TableCell>
                                        {status === 'paid' ? 'Оплачено' : 
                                         status === 'not_paid' ? 'Не оплачено' : 
                                         status === 'partial' ? 'Частично' : status}
                                      </TableCell>
                                      <TableCell>{data.count}</TableCell>
                                      <TableCell>{data.amount?.toLocaleString('ru-RU')} ₽</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  {debtData && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Всего должников
                            </Typography>
                            <Typography variant="h4" color="error.main">
                              {debtData.total_debtors}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Общая задолженность
                            </Typography>
                            <Typography variant="h4" color="error.main">
                              {debtData.total_debt?.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Список должников
                            </Typography>
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Участок</TableCell>
                                    <TableCell>Собственник</TableCell>
                                    <TableCell>Контакты</TableCell>
                                    <TableCell>Сумма долга</TableCell>
                                    <TableCell>Статус</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {debtData.debtors?.map((debtor, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{debtor.plot_number}</TableCell>
                                      <TableCell>{debtor.owner_name}</TableCell>
                                      <TableCell>
                                        <Box>
                                          {debtor.owner_phone && (
                                            <Typography variant="body2">{debtor.owner_phone}</Typography>
                                          )}
                                          {debtor.owner_email && (
                                            <Typography variant="body2" color="textSecondary">
                                              {debtor.owner_email}
                                            </Typography>
                                          )}
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" color="error.main">
                                          {debtor.debt_amount?.toLocaleString('ru-RU')} ₽
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip 
                                          label={debtor.status} 
                                          size="small"
                                          color={debtor.status === 'Не оплачено' ? 'error' : 'warning'}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  {financialData && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Общий доход
                            </Typography>
                            <Typography variant="h4" color="success.main">
                              {financialData.total_income?.toLocaleString('ru-RU')} ₽
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Период: {new Date(financialData.period_start).toLocaleDateString('ru-RU')} - 
                              {new Date(financialData.period_end).toLocaleDateString('ru-RU')}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Доход по месяцам
                            </Typography>
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Месяц</TableCell>
                                    <TableCell>Количество платежей</TableCell>
                                    <TableCell>Сумма</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {financialData.monthly_data?.map((monthData, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {new Date(monthData.month + '-01').toLocaleDateString('ru-RU', { 
                                          year: 'numeric', 
                                          month: 'long' 
                                        })}
                                      </TableCell>
                                      <TableCell>{monthData.count}</TableCell>
                                      <TableCell>
                                        {monthData.amount?.toLocaleString('ru-RU')} ₽
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}
              
              {activeTab === 3 && (
                <Box>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Название</TableCell>
                          <TableCell>Шаблон</TableCell>
                          <TableCell>Формат</TableCell>
                          <TableCell>Статус</TableCell>
                          <TableCell>Создано</TableCell>
                          <TableCell>Действия</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {report.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {report.generated_by_name}
                              </Typography>
                            </TableCell>
                            <TableCell>{report.template_name}</TableCell>
                            <TableCell>
                              <Chip 
                                icon={getFormatIcon(report.format)}
                                label={report.format.toUpperCase()}
                                color={getFormatColor(report.format)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={getStatusText(report.status)} 
                                color={getStatusColor(report.status)} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(report.created_at).toLocaleString('ru-RU')}
                            </TableCell>
                            <TableCell>
                              {report.status === 'completed' && (
                                <Tooltip title="Скачать">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDownloadReport(report.id)}
                                  >
                                    <DownloadIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Удалить">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteReport(report.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Диалог генерации отчета */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Генерация отчета</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Шаблон отчета</InputLabel>
              <Select
                name="template_id"
                value={reportData.template_id}
                onChange={(e) => setReportData({...reportData, template_id: e.target.value})}
                label="Шаблон отчета"
              >
                {templates.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Название отчета"
              name="name"
              value={reportData.name}
              onChange={(e) => setReportData({...reportData, name: e.target.value})}
              margin="normal"
              helperText="Если не указано, будет использована текущая дата и время"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Формат отчета</InputLabel>
              <Select
                name="format"
                value={reportData.format}
                onChange={(e) => setReportData({...reportData, format: e.target.value})}
                label="Формат отчета"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Отчет будет сгенерирован на основе выбранного шаблона и доступен для скачивания
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleGenerateReport} 
            variant="contained" 
            disabled={generating || !reportData.template_id}
            startIcon={generating ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
          >
            {generating ? 'Генерация...' : 'Сгенерировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ReportsDashboard;