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
import PaymentReport from './PaymentReport';
import DataExport from './DataExport';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Отчеты и экспорт
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
                <Tab label="Отчет по платежам" />
                <Tab label="Экспорт данных" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && <PaymentReport />}
            {activeTab === 1 && <DataExport />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Reports;