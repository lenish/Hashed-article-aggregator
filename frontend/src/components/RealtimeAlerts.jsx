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

const getAlertIcon = (level) => {
  switch (level) {
    case 'red':
      return <ErrorIcon sx={{ color: '#ef4444' }} />;
    case 'amber':
      return <WarningIcon sx={{ color: '#f59e0b' }} />;
    default:
      return <InfoIcon sx={{ color: '#22c55e' }} />;
  }
};

const getAlertColor = (level) => {
  switch (level) {
    case 'red':
      return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#fca5a5' };
    case 'amber':
      return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fcd34d' };
    default:
      return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#86efac' };
  }
};

const RealtimeAlerts = ({ alerts = [], onRefresh, onAlertClick }) => {
  const unreadCount = alerts.filter(a => !a.read).length;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon sx={{ color: 'primary.light' }} />
          </Badge>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            Realtime Alerts
          </Typography>
        </Box>
        <IconButton size="small" onClick={onRefresh} sx={{ color: 'text.secondary' }}>
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
              No new alerts.
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
                    borderBottom: '1px solid',
                    borderColor: 'divider',
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
                          color: 'text.primary',
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
                            bgcolor: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
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
