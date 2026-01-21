import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Drawer,
  useMediaQuery,
  useTheme,
  IconButton,
  Snackbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RiskStatusCards from '../components/RiskStatusCards';
import FilterSidebar from '../components/FilterSidebar';
import NewsFeedCard from '../components/NewsFeedCard';
import AIStrategyPanel from '../components/AIStrategyPanel';
import RealtimeAlerts from '../components/RealtimeAlerts';
import TeamWorkflow from '../components/TeamWorkflow';
import { useAuth } from '../contexts/AuthContext';
import {
  getArticles,
  getCategories,
  getDashboardStats,
  getWorkflowStats,
  updateArticleStatus,
  updateAssignee,
  updateActionItems,
  analyzeArticle,
  collectArticles
} from '../services/api';

const DRAWER_WIDTH = 280;
const RIGHT_PANEL_WIDTH = 320;

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  // State
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [workflowStats, setWorkflowStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Filters
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    risk_level: '',
    status: '',
    date_from: '',
    date_to: '',
    exclude_resolved: true
  });

  // Realtime alerts (mocked for now, will be from API/WebSocket)
  const [alerts, setAlerts] = useState([]);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: 15,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== false)
        )
      };

      const response = await getArticles(params);
      setArticles(response.articles || []);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const [dashStats, workStats, categoriesData] = await Promise.all([
        getDashboardStats(),
        getWorkflowStats(),
        getCategories()
      ]);
      setDashboardStats(dashStats);
      setWorkflowStats(workStats);
      setCategories(categoriesData.categories || []);

      // Create alerts from critical articles
      if (dashStats?.risk_levels?.red > 0) {
        setAlerts(prev => {
          const newAlert = {
            id: Date.now(),
            title: `심각 리스크 기사 ${dashStats.risk_levels.red}건 발견`,
            risk_level: 'red',
            created_at: new Date().toISOString(),
            read: false
          };
          return [newAlert, ...prev.slice(0, 9)];
        });
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Handlers
  const handleSearch = () => {
    setPage(1);
    fetchArticles();
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      risk_level: '',
      status: '',
      date_from: '',
      date_to: '',
      exclude_resolved: true
    });
    setPage(1);
  };

  const handleCardClick = (riskLevel) => {
    if (riskLevel === 'green') {
      setFilters(prev => ({ ...prev, status: 'resolved', risk_level: '' }));
    } else {
      setFilters(prev => ({ ...prev, risk_level: riskLevel, status: '' }));
    }
    setPage(1);
  };

  const handleViewStrategy = (article) => {
    setSelectedArticle(article);
  };

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      await updateArticleStatus(articleId, newStatus);
      setSnackbar({ open: true, message: '상태가 변경되었습니다.', severity: 'success' });
      fetchArticles();
      fetchStats();
      if (selectedArticle?.id === articleId) {
        setSelectedArticle(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setSnackbar({ open: true, message: '상태 변경에 실패했습니다.', severity: 'error' });
    }
  };

  const handleAssign = async (article) => {
    // For now, auto-assign to current user
    try {
      await updateAssignee(article.id, user?.id);
      setSnackbar({ open: true, message: '담당자가 지정되었습니다.', severity: 'success' });
      fetchArticles();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: '담당자 지정에 실패했습니다.', severity: 'error' });
    }
  };

  const handleActionItemToggle = async (articleId, itemIndex) => {
    const article = articles.find(a => a.id === articleId) || selectedArticle;
    if (!article?.action_items) return;

    const updatedItems = article.action_items.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );

    try {
      await updateActionItems(articleId, updatedItems);
      if (selectedArticle?.id === articleId) {
        setSelectedArticle(prev => ({ ...prev, action_items: updatedItems }));
      }
    } catch (err) {
      console.error('Action item toggle error:', err);
    }
  };

  const handleAIAnalyze = async () => {
    if (!selectedArticle) {
      setSnackbar({ open: true, message: '분석할 기사를 선택하세요.', severity: 'warning' });
      return;
    }

    try {
      setIsAnalyzing(true);
      const result = await analyzeArticle(selectedArticle.id);
      setSelectedArticle(result.article);
      setSnackbar({ open: true, message: 'AI 분석이 완료되었습니다.', severity: 'success' });
      fetchArticles();
    } catch (err) {
      setSnackbar({ open: true, message: 'AI 분석에 실패했습니다.', severity: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = (article) => {
    navigator.clipboard.writeText(article.url);
    setSnackbar({ open: true, message: '링크가 클립보드에 복사되었습니다.', severity: 'info' });
  };

  const handleAlertClick = (alert) => {
    setFilters(prev => ({ ...prev, risk_level: alert.risk_level }));
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
  };

  // Render
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Left Sidebar - Filters (Desktop) */}
      {!isMobile && (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            p: 2,
            borderRight: '1px solid #e0e0e0',
            overflow: 'auto'
          }}
        >
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            onAIAnalyze={handleAIAnalyze}
            categories={categories}
            isAnalyzing={isAnalyzing}
          />
        </Box>
      )}

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, p: 2 } }}
      >
        <FilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onSearch={() => { handleSearch(); setMobileFilterOpen(false); }}
          onClear={handleClearFilters}
          onAIAnalyze={handleAIAnalyze}
          categories={categories}
          isAnalyzing={isAnalyzing}
        />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileFilterOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" fontWeight={700}>
              AI 리스크 모니터링 & 대응
            </Typography>
          </Box>

          {/* Status Cards */}
          <RiskStatusCards stats={dashboardStats} onCardClick={handleCardClick} />
        </Box>

        {/* News Feed */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : articles.length === 0 ? (
            <Alert severity="info">표시할 기사가 없습니다.</Alert>
          ) : (
            <>
              {articles.map((article) => (
                <NewsFeedCard
                  key={article.id}
                  article={article}
                  selected={selectedArticle?.id === article.id}
                  onViewStrategy={handleViewStrategy}
                  onStatusChange={(a) => handleStatusChange(a.id, 'reviewing')}
                  onShare={handleShare}
                  onAssign={handleAssign}
                />
              ))}

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
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
        </Box>
      </Box>

      {/* Right Panel - AI Strategy + Alerts + Workflow (Desktop) */}
      {!isMobile && (
        <Box
          sx={{
            width: RIGHT_PANEL_WIDTH,
            flexShrink: 0,
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* AI Strategy Panel */}
          <Box sx={{ flex: 1, p: 2, overflow: 'auto', minHeight: '40%' }}>
            <AIStrategyPanel
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
              onActionItemToggle={handleActionItemToggle}
              onStatusChange={handleStatusChange}
              isAnalyzing={isAnalyzing}
            />
          </Box>

          {/* Realtime Alerts */}
          <Box sx={{ height: '30%', p: 2, pt: 0, overflow: 'hidden' }}>
            <RealtimeAlerts
              alerts={alerts}
              onRefresh={fetchStats}
              onAlertClick={handleAlertClick}
            />
          </Box>

          {/* Team Workflow */}
          <Box sx={{ height: '30%', p: 2, pt: 0, overflow: 'hidden' }}>
            <TeamWorkflow workflowStats={workflowStats} />
          </Box>
        </Box>
      )}

      {/* Mobile AI Strategy Drawer */}
      {isMobile && selectedArticle && (
        <Drawer
          anchor="right"
          open={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          sx={{ '& .MuiDrawer-paper': { width: '100%', maxWidth: 400 } }}
        >
          <AIStrategyPanel
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onActionItemToggle={handleActionItemToggle}
            onStatusChange={handleStatusChange}
            isAnalyzing={isAnalyzing}
          />
        </Drawer>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}

export default HomePage;
