import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import PlotList from './components/plots/PlotList';
import OwnerList from './components/owners/OwnerList';
import PaymentList from './components/payments/PaymentList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="plots" element={<PlotList />} />
          <Route path="owners" element={<OwnerList />} />
          <Route path="payments" element={<PaymentList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;