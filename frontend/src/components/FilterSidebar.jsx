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
        필터 및 검색
      </Typography>

      {/* 고급 옵션 */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        고급 옵션
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
          <MenuItem value="title">가치 검색</MenuItem>
          <MenuItem value="keyword">키워드 검색</MenuItem>
        </Select>
      </FormControl>

      {/* 카테고리 */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        카테고리
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
          <MenuItem value="">전체</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 날짜 */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        날짜
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

      {/* 키워드 */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        키워드
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={filters.keyword || ''}
        onChange={handleChange('keyword')}
        placeholder="키워드, 타이틀 등"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.default',
            '& fieldset': { borderColor: 'divider' }
          }
        }}
      />

      {/* AI 분석 버튼 */}
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
        {isAnalyzing ? 'AI 분석 중...' : 'AI 분석 시작'}
      </Button>
    </Box>
  );
};

export default FilterSidebar;
