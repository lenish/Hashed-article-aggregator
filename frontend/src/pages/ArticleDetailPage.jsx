import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
  Chip,
  Stack,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { getArticle } from '../services/api'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

function ArticleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticle(id)
        setArticle(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!article) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography>기사를 찾을 수 없습니다.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          돌아가기
        </Button>
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        목록으로
      </Button>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {article.category && (
          <Chip label={article.category} color="primary" />
        )}
      </Stack>

      <Typography variant="h4" component="h1" gutterBottom>
        {article.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {article.source} •{' '}
        {article.published_date &&
          format(new Date(article.published_date), 'PPP p', { locale: ko })}
      </Typography>

      <Typography variant="body1" paragraph>
        {article.description}
      </Typography>

      {article.content && (
        <Typography variant="body1" paragraph>
          {article.content}
        </Typography>
      )}

      {article.keywords && article.keywords.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            키워드
          </Typography>
          {article.keywords.map((keyword, index) => (
            <Chip key={index} label={keyword} size="small" sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          endIcon={<OpenInNewIcon />}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          원문 보기
        </Button>
      </Box>
    </Paper>
  )
}

export default ArticleDetailPage
