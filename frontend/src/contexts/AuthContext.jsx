import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 토큰 저장/삭제
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Auth validation failed:', err);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Google OAuth 시작
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const response = await api.get('/auth/google');
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError('Failed to start Google authentication');
      console.error('Google auth error:', err);
    }
  };

  // OAuth 콜백 처리
  const handleAuthCallback = async (code) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/google/callback', { code });
      const { token, user: userData } = response.data;
      setToken(token);
      setUser(userData);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Authentication failed';
      setError(errorMessage);
      console.error('Auth callback error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 토큰으로 직접 로그인 (리디렉션 후)
  const loginWithToken = async (token) => {
    try {
      setLoading(true);
      setError(null);
      setToken(token);
      const response = await api.get('/auth/me');
      setUser(response.data);
      return true;
    } catch (err) {
      setToken(null);
      setError('Invalid token');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginWithGoogle,
    handleAuthCallback,
    loginWithToken,
    logout,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
