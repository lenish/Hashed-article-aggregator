import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';

const FilterSidebar = ({
  filters,
  onFilterChange,
  onSearch,
  onClear,
  onAIAnalyze,
  categories,
  isAnalyzing
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        height: 'fit-content'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          필터 및 검색
        </Typography>
      </Box>

      {/* 키워드 검색 */}
      <TextField
        fullWidth
        size="small"
        label="키워드 검색"
        value={filters.keyword || ''}
        onChange={handleChange('keyword')}
        placeholder="기사 제목 검색..."
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
        sx={{ mb: 2 }}
      />

      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>고급 옵션</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {/* 카테고리 */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={filters.category || ''}
              label="카테고리"
              onChange={handleChange('category')}
            >
              <MenuItem value="">전체</MenuItem>
              {categories?.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 리스크 레벨 */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>리스크 레벨</InputLabel>
            <Select
              value={filters.risk_level || ''}
              label="리스크 레벨"
              onChange={handleChange('risk_level')}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="red">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#dc3545', mr: 1 }} />
                  Red (심각)
                </Box>
              </MenuItem>
              <MenuItem value="amber">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffc107', mr: 1 }} />
                  Amber (주의)
                </Box>
              </MenuItem>
              <MenuItem value="green">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28a745', mr: 1 }} />
                  Green (정상)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* 상태 */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={filters.status || ''}
              label="상태"
              onChange={handleChange('status')}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="pending">대기 중</MenuItem>
              <MenuItem value="reviewing">검토 중</MenuItem>
              <MenuItem value="resolved">완료</MenuItem>
              <MenuItem value="ignored">무시</MenuItem>
            </Select>
          </FormControl>

          {/* 날짜 범위 */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            날짜 범위
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              type="date"
              label="시작일"
              value={filters.date_from || ''}
              onChange={handleChange('date_from')}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="종료일"
              value={filters.date_to || ''}
              onChange={handleChange('date_to')}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* 대응 완료 제외 토글 */}
          <FormControlLabel
            control={
              <Switch
                checked={filters.exclude_resolved || false}
                onChange={handleChange('exclude_resolved')}
                color="primary"
              />
            }
            label="대응 완료 제외"
            sx={{ mb: 1 }}
          />
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* 버튼들 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onSearch}
          startIcon={<SearchIcon />}
        >
          검색
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={onClear}
          startIcon={<ClearIcon />}
        >
          필터 초기화
        </Button>

        <Divider sx={{ my: 1 }} />

        <Button
          variant="contained"
          fullWidth
          color="secondary"
          onClick={onAIAnalyze}
          disabled={isAnalyzing}
          startIcon={<PlayArrowIcon />}
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd6 30%, #6a4190 90%)'
            }
          }}
        >
          {isAnalyzing ? 'AI 분석 중...' : 'AI 분석 시작'}
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterSidebar;
