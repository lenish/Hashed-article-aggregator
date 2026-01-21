import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== 기존 API ==========

// 기사 목록 조회
export const getArticles = async (params = {}) => {
  const response = await api.get('/articles/', { params });
  return response.data;
};

// 오늘의 기사 조회
export const getTodayArticles = async () => {
  const response = await api.get('/articles/today');
  return response.data;
};

// 카테고리 목록 조회
export const getCategories = async () => {
  const response = await api.get('/articles/categories');
  return response.data;
};

// 언론사 목록 조회
export const getSources = async () => {
  const response = await api.get('/sources/');
  return response.data;
};

// 통계 조회
export const getStats = async () => {
  const response = await api.get('/articles/stats');
  return response.data;
};

// 특정 기사 조회
export const getArticle = async (id) => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

// 수동 기사 수집
export const collectArticles = async () => {
  const response = await api.post('/scheduler/collect');
  return response.data;
};

// ========== 리스크 관리 API ==========

// 대시보드 통계 조회
export const getDashboardStats = async () => {
  const response = await api.get('/articles/dashboard-stats');
  return response.data;
};

// 심각 리스크 기사 조회
export const getCriticalArticles = async () => {
  const response = await api.get('/articles/critical');
  return response.data;
};

// 워크플로우 통계 조회
export const getWorkflowStats = async () => {
  const response = await api.get('/articles/workflow-stats');
  return response.data;
};

// 기사 상태 변경
export const updateArticleStatus = async (articleId, status) => {
  const response = await api.patch(`/articles/${articleId}/status`, { status });
  return response.data;
};

// 기사 리스크 레벨 변경
export const updateArticleRiskLevel = async (articleId, riskLevel) => {
  const response = await api.patch(`/articles/${articleId}/risk-level`, { risk_level: riskLevel });
  return response.data;
};

// 담당자 지정
export const updateAssignee = async (articleId, assigneeId) => {
  const response = await api.patch(`/articles/${articleId}/assignee`, { assignee_id: assigneeId });
  return response.data;
};

// 액션 아이템 업데이트
export const updateActionItems = async (articleId, actionItems) => {
  const response = await api.patch(`/articles/${articleId}/action-items`, { action_items: actionItems });
  return response.data;
};

// ========== AI 분석 API ==========

// AI 분석 실행
export const analyzeArticle = async (articleId) => {
  const response = await api.post(`/articles/${articleId}/ai-analyze`);
  return response.data;
};

// ========== 인증 API ==========

// Google OAuth URL 가져오기
export const getGoogleAuthUrl = async () => {
  const response = await api.get('/auth/google');
  return response.data;
};

// OAuth 콜백 처리
export const handleGoogleCallback = async (code) => {
  const response = await api.post('/auth/google/callback', { code });
  return response.data;
};

// 현재 사용자 정보 조회
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// 사용자 목록 조회
export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

// 로그아웃
export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// 토큰 검증
export const validateToken = async () => {
  const response = await api.get('/auth/validate');
  return response.data;
};

// ========== 댓글 API ==========

// 기사 댓글 조회
export const getArticleComments = async (articleId) => {
  const response = await api.get(`/comments/article/${articleId}`);
  return response.data;
};

// 댓글 작성
export const createComment = async (articleId, content) => {
  const response = await api.post(`/comments/article/${articleId}`, { content });
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// ========== 알림 API ==========

// Slack 테스트 알림
export const sendSlackTestNotification = async () => {
  const response = await api.post('/notifications/slack/test');
  return response.data;
};

// Telegram 테스트 알림
export const sendTelegramTestNotification = async () => {
  const response = await api.post('/notifications/telegram/test');
  return response.data;
};

export default api;
