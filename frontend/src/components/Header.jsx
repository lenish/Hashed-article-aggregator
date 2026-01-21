import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: 3 }}>
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          {/* #HASHED 텍스트 로고 */}
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '18px',
              fontStyle: 'italic',
              color: 'text.primary',
              letterSpacing: '-0.5px',
              mr: 0.5
            }}
          >
            #
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '18px',
              fontStyle: 'italic',
              color: 'text.primary',
              letterSpacing: '-0.5px'
            }}
          >
            HASHED
          </Typography>
          <Typography
            sx={{
              ml: 1.5,
              fontSize: '13px',
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            Risk Manager
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="알림">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="도움말">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 28,
              height: 28,
              ml: 1,
              bgcolor: '#6366f1',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            H
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
