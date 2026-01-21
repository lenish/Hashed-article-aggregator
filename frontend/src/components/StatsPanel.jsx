import React from 'react'
import { Paper, Typography, Grid, Box } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import TodayIcon from '@mui/icons-material/Today'
import CategoryIcon from '@mui/icons-material/Category'

function StatsPanel({ stats }) {
  if (!stats) return null

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        통계
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Box>
              <Typography variant="h4">
                {Object.keys(stats.category_counts || {}).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                카테고리 수
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default StatsPanel
