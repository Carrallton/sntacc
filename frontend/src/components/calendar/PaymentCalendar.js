import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const PaymentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Пустые дни в начале месяца
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ width: 40, height: 40 }} />);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      // Имитация платежей (в реальной системе будут данные из API)
      const hasPayments = day % 5 === 0; // Каждый 5-й день имеет платежи
      
      days.push(
        <Box
          key={day}
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: isSelected 
              ? 'primary.main' 
              : isToday 
                ? 'secondary.main' 
                : 'transparent',
            color: isSelected || isToday ? 'white' : 'text.primary',
            border: hasPayments ? '2px solid success.main' : 'none',
            '&:hover': {
              backgroundColor: isSelected ? 'primary.main' : 'action.hover',
            }
          }}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </Box>
      );
    }

    return days;
  };

  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Календарь платежей
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={() => navigateMonth(-1)}>
                <PrevIcon />
              </IconButton>
              
              <Typography variant="h6">
                {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </Typography>
              
              <IconButton onClick={() => navigateMonth(1)}>
                <NextIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                {weekdays.map(day => (
                  <Grid item xs={12/7} key={day}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      fontWeight: 'bold', 
                      color: 'text.secondary' 
                    }}>
                      {day}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                {renderCalendar()}
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, border: '2px solid success.main', borderRadius: '50%' }} />
                <Typography variant="caption">Дни с платежами</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: 'primary.main', borderRadius: '50%' }} />
                <Typography variant="caption">Выбранный день</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: 'secondary.main', borderRadius: '50%' }} />
                <Typography variant="caption">Сегодня</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Платежи за {selectedDate.toLocaleDateString('ru-RU')}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                icon={<EventIcon />} 
                label="Нет платежей" 
                color="default" 
                variant="outlined" 
              />
            </Box>
            
            <Typography variant="body2" color="textSecondary">
              Выберите дату в календаре, чтобы просмотреть платежи за этот день.
            </Typography>
            
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => setSelectedDate(new Date())}
            >
              Сегодня
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentCalendar;