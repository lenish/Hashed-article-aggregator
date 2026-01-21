import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const getRiskLevelConfig = (level) => {
  const configs = {
    red: {
      color: '#fca5a5',
      bgColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: '#ef4444',
      label: 'Red',
      dotColor: '#ef4444'
    },
    amber: {
      color: '#fcd34d',
      bgColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: '#f59e0b',
      label: 'Amber',
      dotColor: '#f59e0b'
    },
    green: {
      color: '#86efac',
      bgColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: '#22c55e',
      label: 'Green',
      dotColor: '#22c55e'
    }
  };
  return configs[level] || configs.green;
};

const NewsFeedCard = ({
  article,
  onViewStrategy,
  onStatusChange,
  onShare,
  selected
}) => {
  const riskConfig = getRiskLevelConfig(article.risk_level);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy.MM.dd', { locale: ko });
    } catch {
      return dateString;
    }
  };

  // 키워드 추출 (Key entities)
  const keyEntities = article.keywords?.slice(0, 3) || [];

  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: selected ? 'rgba(99, 102, 241, 0.1)' : 'background.paper',
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        borderLeft: `4px solid ${riskConfig.borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: riskConfig.borderColor,
          bgcolor: 'rgba(255,255,255,0.02)'
        }
      }}
      onClick={() => onViewStrategy && onViewStrategy(article)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* 상단: 리스크 레벨 태그 + 더보기 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Chip
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: riskConfig.dotColor,
                  ml: 0.5
                }}
              />
            }
            label={riskConfig.label}
            size="small"
            sx={{
              bgcolor: riskConfig.bgColor,
              color: riskConfig.color,
              fontWeight: 600,
              fontSize: '12px',
              height: 24,
              '& .MuiChip-icon': {
                ml: 0.5
              }
            }}
          />
          <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={(e) => e.stopPropagation()}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 제목 */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            lineHeight: 1.4,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {article.title}
        </Typography>

        {/* AI 요약 또는 설명 */}
        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            color: 'text.secondary',
            fontSize: '13px',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          <Typography component="span" sx={{ color: 'primary.light', fontWeight: 500 }}>
            AI 요약:
          </Typography>{' '}
          {article.ai_summary || article.description}
        </Typography>

        {/* Key entities */}
        {keyEntities.length > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            <Typography component="span" fontWeight={600}>Key entities:</Typography>{' '}
            {keyEntities.join(', ')}
          </Typography>
        )}

        {/* 액션 버튼들 */}
        <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onViewStrategy && onViewStrategy(article)}
            sx={{
              bgcolor: '#22c55e',
              color: '#fff',
              fontSize: '12px',
              px: 2,
              '&:hover': { bgcolor: '#16a34a' }
            }}
          >
            대응 가이드 보기
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onStatusChange && onStatusChange(article)}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '12px',
              px: 2
            }}
          >
            상태 변경
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onShare && onShare(article)}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '12px',
              px: 2
            }}
          >
            공유
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsFeedCard;
