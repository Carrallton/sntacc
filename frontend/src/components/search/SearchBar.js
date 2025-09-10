import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { searchService } from '../../services/search';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    plots: [],
    owners: [],
    payments: []
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ plots: [], owners: [], payments: [] });
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchService.searchAll(query);
      setSearchResults(results);
      setShowResults(true);
      setActiveIndex(-1);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setSearchResults({ plots: [], owners: [], payments: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const totalItems = 
        searchResults.plots.length + 
        searchResults.owners.length + 
        searchResults.payments.length;
      setActiveIndex(prev => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ plots: [], owners: [], payments: [] });
    setShowResults(false);
    setActiveIndex(-1);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => searchQuery.trim() && setShowResults(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        size={isMobile ? "small" : "medium"}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            fontSize: isMobile ? '0.875rem' : 'inherit'
          }
        }}
      />

      {showResults && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {loading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List dense>
              {/* Участки */}
              {searchResults.plots.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="subtitle2" color="textSecondary">
                      Участки ({searchResults.plots.length})
                    </Typography>
                  </ListItem>
                  {searchResults.plots.slice(0, 5).map((plot, index) => (
                    <ListItem 
                      button 
                      key={plot.id}
                      sx={{
                        bgcolor: activeIndex === index ? 'action.selected' : 'inherit'
                      }}
                    >
                      <ListItemIcon>
                        <HomeIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Участок ${plot.plot_number}`}
                        secondary={plot.address}
                        primaryTypographyProps={{
                          fontSize: isMobile ? '0.875rem' : 'inherit'
                        }}
                        secondaryTypographyProps={{
                          fontSize: isMobile ? '0.75rem' : 'inherit'
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {/* Собственники */}
              {searchResults.owners.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="subtitle2" color="textSecondary">
                      Собственники ({searchResults.owners.length})
                    </Typography>
                  </ListItem>
                  {searchResults.owners.slice(0, 5).map((owner, index) => {
                    const globalIndex = searchResults.plots.length + index;
                    return (
                      <ListItem 
                        button 
                        key={owner.id}
                        sx={{
                          bgcolor: activeIndex === globalIndex ? 'action.selected' : 'inherit'
                        }}
                      >
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={owner.full_name}
                          secondary={owner.phone || owner.email || 'Нет контактов'}
                          primaryTypographyProps={{
                            fontSize: isMobile ? '0.875rem' : 'inherit'
                          }}
                          secondaryTypographyProps={{
                            fontSize: isMobile ? '0.75rem' : 'inherit'
                          }}
                        />
                      </ListItem>
                    );
                  })}
                  <Divider />
                </>
              )}

              {/* Платежи */}
              {searchResults.payments.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="subtitle2" color="textSecondary">
                      Платежи ({searchResults.payments.length})
                    </Typography>
                  </ListItem>
                  {searchResults.payments.slice(0, 5).map((payment, index) => {
                    const globalIndex = 
                      searchResults.plots.length + 
                      searchResults.owners.length + 
                      index;
                    return (
                      <ListItem 
                        button 
                        key={payment.id}
                        sx={{
                          bgcolor: activeIndex === globalIndex ? 'action.selected' : 'inherit'
                        }}
                      >
                        <ListItemIcon>
                          <PaymentIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Участок ${payment.plot?.plot_number} - ${payment.year} год`}
                          secondary={`${payment.amount} руб. - ${payment.status === 'paid' ? 'Оплачен' : 'Не оплачен'}`}
                          primaryTypographyProps={{
                            fontSize: isMobile ? '0.875rem' : 'inherit'
                          }}
                          secondaryTypographyProps={{
                            fontSize: isMobile ? '0.75rem' : 'inherit'
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </>
              )}

              {/* Нет результатов */}
              {searchResults.plots.length === 0 && 
               searchResults.owners.length === 0 && 
               searchResults.payments.length === 0 && 
               !loading && searchQuery && (
                <ListItem>
                  <ListItemText 
                    primary="Ничего не найдено" 
                    secondary="Попробуйте изменить запрос"
                    primaryTypographyProps={{
                      fontSize: isMobile ? '0.875rem' : 'inherit'
                    }}
                    secondaryTypographyProps={{
                      fontSize: isMobile ? '0.75rem' : 'inherit'
                    }}
                  />
                </ListItem>
              )}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;