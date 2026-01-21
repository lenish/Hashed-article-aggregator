import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <AppBar position="static">
      <Toolbar>
        <LocalHospitalIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          의료 뉴스 애그리게이터
        </Typography>
        <Typography variant="body2">
          매일 업데이트되는 한국 의료 뉴스
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header
