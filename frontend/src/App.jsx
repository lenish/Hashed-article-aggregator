import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// TODO: Google OAuth 설정 후 ProtectedRoute 다시 활성화
const SKIP_AUTH = true;

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Main Routes - Auth temporarily disabled */}
        <Route
          path="/*"
          element={
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              <Header />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/article/:id" element={<ArticleDetailPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
