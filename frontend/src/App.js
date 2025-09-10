import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import PlotList from './components/plots/PlotList';
import OwnerList from './components/owners/OwnerList';
import PaymentList from './components/payments/PaymentList';
import Notifications from './components/notifications/Notifications';
import ReportsDashboard from './components/reports/ReportsDashboard';
import Settings from './components/settings/Settings';
import Profile from './components/profile/Profile';
import PaymentCalendar from './components/calendar/PaymentCalendar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { authService } from './services/auth';
import TaskList from './components/tasks/TaskList';
import DocumentList from './components/documents/DocumentList';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  // Проверяем токен при загрузке приложения
  useEffect(() => {
    if (isAuthenticated) {
      // Можно добавить проверку валидности токена здесь
    }
  }, [isAuthenticated]);
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Защищенные маршруты */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="plots" element={<PlotList />} />
          <Route path="owners" element={<OwnerList />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="documents" element={<DocumentList />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calendar" element={<PaymentCalendar />} />
        </Route>
        
        {/* Редирект с корня на dashboard если аутентифицирован */}
        <Route path="/" element={
          authService.isAuthenticated() ? 
          <Navigate to="/dashboard" /> : 
          <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;