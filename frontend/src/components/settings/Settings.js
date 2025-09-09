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
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import UserManagement from './UserManagement';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Настройки
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
                <Tab label="Общие настройки" />
                <Tab label="Уведомления" />
                <Tab label="Пользователи" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && <GeneralSettings />}
            {activeTab === 1 && <NotificationSettings />}
            {activeTab === 2 && <UserManagement />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Settings;