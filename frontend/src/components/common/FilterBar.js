import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Collapse,
  Grid,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const FilterBar = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  onClearFilters, 
  filterFields,
  children 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Поиск"
          placeholder="Введите текст для поиска..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ minWidth: isMobile ? '100%' : 250 }}
          size={isMobile ? "small" : "medium"}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
          size={isMobile ? "small" : "medium"}
        >
          Фильтры
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="outlined"
            onClick={onClearFilters}
            size={isMobile ? "small" : "medium"}
          >
            Сбросить
          </Button>
        )}
      </Box>
      
      <Collapse in={showFilters}>
        <Grid container spacing={2}>
          {filterFields.map((field) => (
            <Grid item xs={12} md={field.md || 3} key={field.name}>
              <TextField
                fullWidth
                label={field.label}
                type={field.type || 'text'}
                value={filters[field.name] || ''}
                onChange={(e) => onFilterChange(field.name, e.target.value)}
                size={isMobile ? "small" : "medium"}
                {...field.props}
              />
            </Grid>
          ))}
        </Grid>
        
        {children && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default FilterBar;