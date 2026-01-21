import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const getRiskLevelConfig = (level) => {
  const configs = {
    red: {
      color: '#dc3545',
      bgColor: 'rgba(220, 53, 69, 0.1)',
      label: 'Red',
      borderColor: '#dc3545'
    },
    amber: {
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)',
      label: 'Amber',
      borderColor: '#ffc107'
    },
    green: {
      color: '#28a745',
      bgColor: 'rgba(40, 167, 69, 0.1)',
      label: 'Green',
      borderColor: '#28a745'
    }
  };
  return configs[level] || configs.green;
};

const getStatusConfig = (status) => {
  const configs = {
    pending: { color: 'default', label: '대기 중' },
    reviewing: { color: 'primary', label: '검토 중' },
    resolved: { color: 'success', label: '완료' },
    ignored: { color: 'default', label: '무시' }
  };
  return configs[status] || configs.pending;
};

const NewsFeedCard = ({
  article,
  onViewStrategy,
  onStatusChange,
  onShare,
  onAssign,
  selected
}) => {
  const riskConfig = getRiskLevelConfig(article.risk_level);
  const statusConfig = getStatusConfig(article.status);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
    } catch {
      return dateString;
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        border: `2px solid ${selected ? riskConfig.borderColor : 'transparent'}`,
        borderLeft: `4px solid ${riskConfig.borderColor}`,
        background: selected ? riskConfig.bgColor : '#fff',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateX(4px)'
        }
      }}
      onClick={() => onViewStrategy && onViewStrategy(article)}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        {/* 상단: 리스크 레벨 + 카테고리 + 상태 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={riskConfig.label}
            size="small"
            sx={{
              bgcolor: riskConfig.color,
              color: '#fff',
              fontWeight: 700,
              fontSize: '11px'
            }}
          />
          {article.category && (
            <Chip
              label={article.category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '11px' }}
            />
          )}
          <Chip
            label={statusConfig.label}
            size="small"
            color={statusConfig.color}
            sx={{ fontSize: '11px' }}
          />
          {article.assignee && (
            <Chip
              label={article.assignee.name}
              size="small"
              variant="outlined"
              sx={{ fontSize: '11px' }}
              avatar={
                <img
                  src={article.assignee.picture}
                  alt={article.assignee.name}
                  style={{ width: 16, height: 16, borderRadius: '50%' }}
                />
              }
            />
          )}
        </Box>

        {/* 제목 */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            lineHeight: 1.4,
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
          color="text.secondary"
          sx={{
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5
          }}
        >
          {article.ai_summary || article.description}
        </Typography>

        {/* 키워드 태그 */}
        {article.keywords && article.keywords.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
            {article.keywords.slice(0, 4).map((keyword, idx) => (
              <Chip
                key={idx}
                label={keyword}
                size="small"
                sx={{
                  fontSize: '10px',
                  height: 20,
                  bgcolor: '#f0f0f0'
                }}
              />
            ))}
            {article.keywords.length > 4 && (
              <Typography variant="caption" color="text.secondary">
                +{article.keywords.length - 4}
              </Typography>
            )}
          </Box>
        )}

        {/* 하단: 출처, 날짜, 액션 버튼 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {article.source}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {formatDate(article.published_date)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="대응 가이드 보기">
              <IconButton
                size="small"
                onClick={() => onViewStrategy && onViewStrategy(article)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="담당자 지정">
              <IconButton
                size="small"
                onClick={() => onAssign && onAssign(article)}
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="공유">
              <IconButton
                size="small"
                onClick={() => onShare && onShare(article)}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="원문 보기">
              <IconButton
                size="small"
                onClick={() => window.open(article.url, '_blank')}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsFeedCard;
