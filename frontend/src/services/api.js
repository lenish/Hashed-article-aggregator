import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 기사 목록 조회
export const getArticles = async (params = {}) => {
  const response = await api.get('/articles/', { params })
  return response.data
}

// 오늘의 기사 조회
export const getTodayArticles = async () => {
  const response = await api.get('/articles/today')
  return response.data
}

// 카테고리 목록 조회
export const getCategories = async () => {
  const response = await api.get('/articles/categories')
  return response.data
}

// 언론사 목록 조회
export const getSources = async () => {
  const response = await api.get('/sources/')
  return response.data
}

// 통계 조회
export const getStats = async () => {
  const response = await api.get('/articles/stats')
  return response.data
}

// 특정 기사 조회
export const getArticle = async (id) => {
  const response = await api.get(`/articles/${id}`)
  return response.data
}

// 수동 기사 수집
export const collectArticles = async () => {
  const response = await api.post('/scheduler/collect')
  return response.data
}

export default api
