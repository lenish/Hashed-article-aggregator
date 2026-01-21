import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Badge
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const getAlertIcon = (level) => {
  switch (level) {
    case 'red':
      return <ErrorIcon sx={{ color: '#dc3545' }} />;
    case 'amber':
      return <WarningIcon sx={{ color: '#ffc107' }} />;
    default:
      return <InfoIcon sx={{ color: '#17a2b8' }} />;
  }
};

const getAlertColor = (level) => {
  switch (level) {
    case 'red':
      return { bg: 'rgba(220, 53, 69, 0.1)', border: '#dc3545' };
    case 'amber':
      return { bg: 'rgba(255, 193, 7, 0.1)', border: '#ffc107' };
    default:
      return { bg: 'rgba(23, 162, 184, 0.1)', border: '#17a2b8' };
  }
};

const RealtimeAlerts = ({ alerts = [], onRefresh, onAlertClick }) => {
  const unreadCount = alerts.filter(a => !a.read).length;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ko });
    } catch {
      return '';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon color="primary" />
          </Badge>
          <Typography variant="subtitle1" fontWeight={600}>
            실시간 알림
          </Typography>
        </Box>
        <IconButton size="small" onClick={onRefresh}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Alert List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {alerts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              새로운 알림이 없습니다.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {alerts.map((alert, index) => {
              const colors = getAlertColor(alert.risk_level);
              return (
                <ListItem
                  key={alert.id || index}
                  sx={{
                    borderBottom: '1px solid #f0f0f0',
                    bgcolor: alert.read ? 'transparent' : colors.bg,
                    borderLeft: `3px solid ${colors.border}`,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: colors.bg
                    }
                  }}
                  onClick={() => onAlertClick && onAlertClick(alert)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getAlertIcon(alert.risk_level)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: alert.read ? 400 : 600,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {alert.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={alert.risk_level?.toUpperCase()}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '10px',
                            bgcolor: colors.border,
                            color: '#fff'
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(alert.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default RealtimeAlerts;
