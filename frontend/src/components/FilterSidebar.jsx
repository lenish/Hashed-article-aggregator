import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const FilterSidebar = ({
  filters,
  onFilterChange,
  onSearch,
  onClear,
  onAIAnalyze,
  categories,
  isAnalyzing
}) => {
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Filters & Search
      </Typography>

      {/* Advanced options */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Advanced Options
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <Select
          value={filters.keyword ? 'keyword' : 'title'}
          displayEmpty
          sx={{
            bgcolor: 'background.default',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider'
            }
          }}
        >
          <MenuItem value="title">Title Search</MenuItem>
          <MenuItem value="keyword">Keyword Search</MenuItem>
        </Select>
      </FormControl>

      {/* Category */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Category
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <Select
          value={filters.category || ''}
          displayEmpty
          onChange={handleChange('category')}
          sx={{
            bgcolor: 'background.default',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider'
            }
          }}
        >
          <MenuItem value="">All</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Date
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          type="date"
          value={filters.date_from || ''}
          onChange={handleChange('date_from')}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
              '& fieldset': { borderColor: 'divider' }
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
        <Typography color="text.secondary">~</Typography>
        <TextField
          size="small"
          type="date"
          value={filters.date_to || ''}
          onChange={handleChange('date_to')}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
              '& fieldset': { borderColor: 'divider' }
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Keyword */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Keyword
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={filters.keyword || ''}
        onChange={handleChange('keyword')}
        placeholder="Keyword, title, etc."
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
            '& fieldset': { borderColor: 'divider' }
          }
        }}
      />

      {/* AI Analysis button */}
      <Button
        variant="contained"
        fullWidth
        onClick={onAIAnalyze}
        disabled={isAnalyzing}
        startIcon={<PlayArrowIcon />}
        sx={{
          py: 1.2,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
          }
        }}
      >
        {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
      </Button>
    </Box>
  );
};

export default FilterSidebar;
