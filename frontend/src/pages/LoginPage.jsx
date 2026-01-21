import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import ShieldIcon from '@mui/icons-material/Shield';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { loginWithGoogle, loading, error, clearError } = useAuth();

  const handleGoogleLogin = () => {
    clearError();
    loginWithGoogle();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '28px'
                }}
              >
                H
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a2e',
                  lineHeight: 1.2
                }}
              >
                Hashed
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: '#666',
                  fontWeight: 500
                }}
              >
                Risk Manager
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <ShieldIcon sx={{ color: '#0f3460', mr: 1 }} />
            <Typography variant="h6" color="text.secondary">
              AI 리스크 모니터링 & 대응
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            @hashed.com 계정으로 로그인하세요
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Google Login Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              background: '#fff',
              color: '#333',
              border: '1px solid #ddd',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                background: '#f5f5f5',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }
            }}
          >
            {loading ? '로그인 중...' : 'Google 계정으로 로그인'}
          </Button>

          {/* Info */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
            해시드 팀 전용 서비스입니다.
            <br />
            @hashed.com 이메일만 허용됩니다.
          </Typography>
        </Paper>

        {/* Footer */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          © 2024 Hashed. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;
