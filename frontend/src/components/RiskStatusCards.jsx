import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RiskStatusCards = ({ stats, onCardClick }) => {
  const cards = [
    {
      key: 'red',
      title: '심각 대응 필요',
      count: stats?.risk_levels?.red || 0,
      color: '#dc3545',
      bgColor: 'rgba(220, 53, 69, 0.1)',
      icon: <ErrorIcon sx={{ fontSize: 32 }} />,
      description: 'Red'
    },
    {
      key: 'amber',
      title: '검토 중',
      count: stats?.risk_levels?.amber || 0,
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)',
      icon: <WarningIcon sx={{ fontSize: 32 }} />,
      description: 'Amber'
    },
    {
      key: 'green',
      title: '대응 완료',
      count: stats?.status?.resolved || 0,
      color: '#28a745',
      bgColor: 'rgba(40, 167, 69, 0.1)',
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      description: 'Green'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={4} key={card.key}>
          <Card
            sx={{
              background: card.bgColor,
              border: `2px solid ${card.color}`,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 16px ${card.color}40`
              }
            }}
            onClick={() => onCardClick && onCardClick(card.key)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box sx={{ color: card.color, mb: 1 }}>
                {card.icon}
              </Box>
              <Typography
                variant="h3"
                sx={{ color: card.color, fontWeight: 700, mb: 0.5 }}
              >
                {card.count}건
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: card.color, fontWeight: 600 }}
              >
                {card.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                ({card.description})
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RiskStatusCards;
