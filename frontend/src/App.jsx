import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ArticleDetailPage from './pages/ArticleDetailPage'

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
