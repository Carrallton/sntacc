import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import UnpaidPlotsList from './UnpaidPlotsList';
import NotificationTemplates from './NotificationTemplates';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Уведомления
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Неоплаченные участки" />
                <Tab label="Шаблоны уведомлений" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && <UnpaidPlotsList />}
            {activeTab === 1 && <NotificationTemplates />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Notifications;