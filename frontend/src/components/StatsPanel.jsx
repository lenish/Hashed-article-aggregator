import React from 'react'
import { Paper, Typography, Grid, Box, Chip, Stack } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import TodayIcon from '@mui/icons-material/Today'
import WarningIcon from '@mui/icons-material/Warning'
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'

function StatsPanel({ stats }) {
  if (!stats) return null

  const sentimentCounts = stats.sentiment_counts || {}

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        통계
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4">{stats.total_articles}</Typography>
              <Typography variant="body2" color="text.secondary">
                전체 기사
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TodayIcon sx={{ mr: 1, color: 'success.main' }} />
            <Box>
              <Typography variant="h4">{stats.today_articles}</Typography>
              <Typography variant="body2" color="text.secondary">
                오늘의 기사
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
            <Box>
              <Typography variant="h4" color="error.main">
                {stats.needs_response_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                대응 필요
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              감성 분포
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<SentimentSatisfiedIcon />}
                label={sentimentCounts.positive || 0}
                size="small"
                color="success"
              />
              <Chip
                icon={<SentimentNeutralIcon />}
                label={sentimentCounts.neutral || 0}
                size="small"
                color="default"
              />
              <Chip
                icon={<SentimentDissatisfiedIcon />}
                label={sentimentCounts.negative || 0}
                size="small"
                color="error"
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default StatsPanel
