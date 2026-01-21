import React from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RiskStatusCards = ({ stats, onCardClick }) => {
  const cards = [
    {
      key: 'red',
      title: '심각 대응 필요',
      count: stats?.risk_levels?.red || 0,
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: '#ef4444',
      textColor: '#fca5a5',
      icon: <ErrorOutlineIcon sx={{ fontSize: 24 }} />
    },
    {
      key: 'amber',
      title: '검토 중',
      count: stats?.risk_levels?.amber || 0,
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#f59e0b',
      textColor: '#fcd34d',
      icon: <WarningAmberIcon sx={{ fontSize: 24 }} />
    },
    {
      key: 'green',
      title: '대응 완료',
      count: stats?.status?.resolved || 0,
      bgColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: '#22c55e',
      textColor: '#86efac',
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
    }
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {cards.map((card) => (
        <Box
          key={card.key}
          onClick={() => onCardClick && onCardClick(card.key)}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: card.bgColor,
            border: `1px solid ${card.borderColor}40`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${card.bgColor}`,
              borderColor: card.borderColor,
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ color: card.textColor }}>
            {card.icon}
          </Box>
          <Typography
            sx={{
              color: card.textColor,
              fontWeight: 600,
              fontSize: '15px'
            }}
          >
            {card.title}: {card.count}건
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default RiskStatusCards;
