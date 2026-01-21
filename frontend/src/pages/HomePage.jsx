import React, { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  TextField,
  Paper,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import ArticleCard from '../components/ArticleCard'
import StatsPanel from '../components/StatsPanel'
import { getArticles, getCategories, getSources, getStats, collectArticles } from '../services/api'

function HomePage() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [sources, setSources] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        per_page: 12,
      }

      if (selectedCategory) {
        params.category = selectedCategory
      }

      if (selectedSource) {
        params.source = selectedSource
      }

      if (dateFrom) {
        params.date_from = dateFrom
      }

      if (dateTo) {
        params.date_to = dateTo
      }

      if (searchKeyword) {
        params.keyword = searchKeyword
      }

      const [articlesData, categoriesData, sourcesData, statsData] = await Promise.all([
        getArticles(params),
        getCategories(),
        getSources(),
        getStats(),
      ])

      setArticles(articlesData.articles)
      setTotalPages(articlesData.total_pages)
      setCategories(categoriesData.categories)
      setSources(sourcesData.sources)
      setStats(statsData)
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCollect = async () => {
    try {
      setCollecting(true)
      const result = await collectArticles()
      alert(`기사 수집 완료!\n수집: ${result.collected}개\n저장: ${result.saved}개`)
      fetchData()
    } catch (err) {
      console.error(err)
      const errorMessage = err.response?.data?.error || '기사 수집 중 오류가 발생했습니다.'
      const errorDetails = err.response?.data?.message || ''
      const errorDocs = err.response?.data?.docs || ''

      let fullMessage = errorMessage
      if (errorDetails) fullMessage += '\n\n' + errorDetails
      if (errorDocs) fullMessage += '\n\n' + errorDocs

      alert(fullMessage)
    } finally {
      setCollecting(false)
    }
  }

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSelectedCategory('')
    setSelectedSource('')
    setDateFrom('')
    setDateTo('')
    setKeyword('')
    setSearchKeyword('')
    setPage(1)
  }

  useEffect(() => {
    fetchData()
  }, [page, selectedCategory, selectedSource, dateFrom, dateTo, searchKeyword])

  if (loading && articles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          한국 의료 뉴스
        </Typography>
        <Typography variant="body1" color="text.secondary">
          매일 업데이트되는 최신 의료 관련 뉴스를 확인하세요
        </Typography>
      </Box>

      <StatsPanel stats={stats} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          필터
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={selectedCategory}
                label="카테고리"
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setPage(1)
                }}
              >
                <MenuItem value="">전체</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>언론사</InputLabel>
              <Select
                value={selectedSource}
                label="언론사"
                onChange={(e) => {
                  setSelectedSource(e.target.value)
                  setPage(1)
                }}
              >
                <MenuItem value="">전체</MenuItem>
                {sources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="시작 날짜"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="종료 날짜"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="키워드 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="제목, 내용 검색"
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                필터 초기화
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleCollect}
                disabled={collecting}
              >
                {collecting ? '수집 중...' : '기사 수집'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {articles.length === 0 ? (
        <Alert severity="info">표시할 기사가 없습니다.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </>
  )
}

export default HomePage
