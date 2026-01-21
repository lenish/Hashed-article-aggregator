import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import ShieldIcon from '@mui/icons-material/Shield'
import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a2e' }}>
      <Toolbar>
        <ShieldIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          Hashed Risk Manager
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          해시드 관련 뉴스 모니터링
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header
