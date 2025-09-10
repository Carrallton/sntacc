import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
} from '@mui/material';
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import UserManagement from './UserManagement';
import SecuritySettings from '../security/SecuritySettings'; // Добавлено
import BackupManagement from '../backup/BackupManagement';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Общие настройки', component: GeneralSettings },
    { label: 'Уведомления', component: NotificationSettings },
    { label: 'Пользователи', component: UserManagement },
    { label: 'Безопасность', component: SecuritySettings }, // Добавлено
    { label: 'Резервное копирование', component: BackupManagement },
  ];

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`settings-tabpanel-${index}`}
        aria-labelledby={`settings-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ pt: isMobile ? 1 : 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <Grid container spacing={isMobile ? 1 : 3}>
      <Grid item xs={12}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom
          sx={{ fontSize: isMobile ? '1.25rem' : '2rem' }}
        >
          Настройки
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: isMobile ? 1 : 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{ 
                  minHeight: isMobile ? 36 : 48,
                  '& .MuiTab-root': {
                    minHeight: isMobile ? 36 : 48,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    py: isMobile ? 0.5 : 1,
                    px: isMobile ? 1 : 2
                  }
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={index} 
                    label={tab.label} 
                    sx={{ 
                      minWidth: isMobile ? 'auto' : 120,
                      px: isMobile ? 1 : 2
                    }}
                  />
                ))}
              </Tabs>
            </Box>
            
            {tabs.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                <tab.component />
              </TabPanel>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Settings;