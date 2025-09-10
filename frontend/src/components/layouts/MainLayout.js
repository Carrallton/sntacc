import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  SwipeableDrawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  Event as EventIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Task as TaskIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import SearchBar from '../search/SearchBar';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Загружаем информацию о текущем пользователе
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      }
    };
    
    loadCurrentUser();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const menuItems = [
    {
      text: 'Панель',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      text: 'Календарь',
      icon: <EventIcon />,
      path: '/calendar'
    },
    {
      text: 'Участки',
      icon: <HomeIcon />,
      path: '/plots'
    },
    {
      text: 'Собственники',
      icon: <PersonIcon />,
      path: '/owners'
    },
    {
      text: 'Платежи',
      icon: <PaymentIcon />,
      path: '/payments'
    },
    {
      text: 'Задачи',
      icon: <TaskIcon />,
      path: '/tasks'
    },
    {
      text: 'Уведомления',
      icon: <NotificationsIcon />,
      path: '/notifications'
    },
    {
      text: 'Документы',
      icon: <DescriptionIcon />,
      path: '/documents'
    },
    {
      text: 'Отчеты',
      icon: <ReportsIcon />,
      path: '/reports'
    },
    {
      text: 'Настройки',
      icon: <SettingsIcon />,
      path: '/settings'
    }
  ];

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          sntacc
        </Typography>
        {isMobile && (
          <IconButton
            sx={{ ml: 'auto' }}
            onClick={handleDrawerToggle}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              minHeight: 48,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                variant: 'body2',
                sx: {
                  fontSize: isMobile ? '0.875rem' : 'inherit',
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Верхняя панель */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ 
          minHeight: 56,
          px: { xs: 1, sm: 2 }
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              padding: '8px'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {isMobile ? 'СНТ' : 'Учет платежей СНТ'}
          </Typography>
          
          {/* Глобальный поиск */}
          {!isMobile && (
            <Box sx={{ mx: 2, width: '300px' }}>
              <SearchBar />
            </Box>
          )}
          
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ padding: '8px' }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'secondary.main',
                fontSize: '0.75rem'
              }}
            >
              <AccountIcon />
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              mt: '45px',
            }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                Профиль
                {currentUser && (
                  <Typography variant="caption" display="block" color="textSecondary">
                    {isMobile ? currentUser.username.substring(0, 10) + '...' : currentUser.username}
                  </Typography>
                )}
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{isMobile ? 'Выйти' : 'Выйти из системы'}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
        
        {/* Поиск для мобильных устройств */}
        {isMobile && (
          <Box sx={{ px: 1, pb: 1 }}>
            <SearchBar />
          </Box>
        )}
      </AppBar>

      {/* Боковое меню для мобильных устройств */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Для мобильных устройств - свайпаемый drawer */}
        <SwipeableDrawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              ...(isMobile && {
                width: '80%',
                maxWidth: 300,
              })
            },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      </Box>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 12, sm: 8 }, // Увеличил отступ для мобильных с поиском
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            px: { xs: 0, sm: 2 },
            py: { xs: 1, sm: 2 }
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;