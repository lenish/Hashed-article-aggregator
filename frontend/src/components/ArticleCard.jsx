import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Stack,
} from '@mui/material'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return format(new Date(dateString), 'PPP p', { locale: ko })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {article.category && (
            <Chip
              label={article.category}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {article.confidence_score && (
            <Chip
              label={`신뢰도 ${(article.confidence_score * 100).toFixed(0)}%`}
              size="small"
              color={article.confidence_score > 0.7 ? 'success' : 'default'}
              variant="outlined"
            />
          )}
        </Stack>

        <Typography variant="h6" component="h2" gutterBottom>
          {article.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {article.description}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {article.source} • {formatDate(article.published_date)}
          </Typography>
        </Box>

        {article.keywords && article.keywords.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {article.keywords.slice(0, 5).map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="small"
                sx={{ mr: 0.5, mt: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          endIcon={<OpenInNewIcon />}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          원문 보기
        </Button>
      </CardActions>
    </Card>
  )
}

export default ArticleCard
