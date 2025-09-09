import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  PictureAsPdf as PdfIcon,
  Home as PlotIcon,
  Person as OwnerIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { reportService } from '../../services/reports';

const DataExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async (dataType, format) => {
    setExporting(true);
    setError(null);
    
    try {
      // Имитация экспорта
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Данные "${dataType}" экспортированы в формат ${format.toUpperCase()}`);
    } catch (err) {
      setError('Ошибка при экспорте: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExporting(false);
    }
  };

  const exportOptions = [
    {
      title: 'Участки',
      icon: <PlotIcon />,
      options: [
        { format: 'excel', label: 'Excel (.xlsx)', icon: <ExcelIcon /> },
        { format: 'csv', label: 'CSV (.csv)', icon: <CsvIcon /> },
        { format: 'pdf', label: 'PDF (.pdf)', icon: <PdfIcon /> },
      ]
    },
    {
      title: 'Собственники',
      icon: <OwnerIcon />,
      options: [
        { format: 'excel', label: 'Excel (.xlsx)', icon: <ExcelIcon /> },
        { format: 'csv', label: 'CSV (.csv)', icon: <CsvIcon /> },
        { format: 'pdf', label: 'PDF (.pdf)', icon: <PdfIcon /> },
      ]
    },
    {
      title: 'Платежи',
      icon: <PaymentIcon />,
      options: [
        { format: 'excel', label: 'Excel (.xlsx)', icon: <ExcelIcon /> },
        { format: 'csv', label: 'CSV (.csv)', icon: <CsvIcon /> },
        { format: 'pdf', label: 'PDF (.pdf)', icon: <PdfIcon /> },
      ]
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Экспорт данных
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Экспортируйте данные в различные форматы для дальнейшей обработки
        </Typography>
      </Grid>
      
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Выберите данные для экспорта
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Все данные будут экспортированы в выбранном формате
              </Typography>
            </Box>
            
            <List>
              {exportOptions.map((category, index) => (
                <Box key={category.title}>
                  <ListItem>
                    <ListItemIcon>
                      {category.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.title}
                      primaryTypographyProps={{ variant: 'h6' }}
                    />
                  </ListItem>
                  
                  <Box sx={{ pl: 4, pb: 2 }}>
                    <Grid container spacing={2}>
                      {category.options.map((option) => (
                        <Grid item key={option.format}>
                          <Button
                            variant="outlined"
                            startIcon={option.icon}
                            onClick={() => handleExport(category.title, option.format)}
                            disabled={exporting}
                            size="small"
                          >
                            {exporting ? <CircularProgress size={20} /> : option.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  {index < exportOptions.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Информация об экспорте
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Данные экспортируются в выбранном формате<br/>
              • Файлы сохраняются в папку загрузок вашего браузера<br/>
              • Для больших объемов данных экспорт может занять несколько минут<br/>
              • Все данные экспортируются в кодировке UTF-8
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DataExport;