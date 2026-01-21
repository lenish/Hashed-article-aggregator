import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken, handleAuthCallback, error } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      // 토큰이 URL에 있는 경우 (서버 리디렉션)
      const token = searchParams.get('token');
      if (token) {
        const success = await loginWithToken(token);
        if (success) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // 코드가 URL에 있는 경우 (직접 콜백)
      const code = searchParams.get('code');
      if (code) {
        const success = await handleAuthCallback(code);
        if (success) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // 에러 파라미터
      const errorParam = searchParams.get('error');
      if (errorParam) {
        navigate('/login', { replace: true });
        return;
      }

      // 아무 파라미터도 없으면 로그인으로
      navigate('/login', { replace: true });
    };

    processAuth();
  }, [searchParams, navigate, loginWithToken, handleAuthCallback]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}
    >
      <CircularProgress sx={{ color: '#fff', mb: 3 }} />
      <Typography variant="h6" sx={{ color: '#fff' }}>
        로그인 처리 중...
      </Typography>
      {error && (
        <Typography variant="body2" sx={{ color: '#ff6b6b', mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AuthCallbackPage;
