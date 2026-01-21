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
  Snackbar,
  Button,
  ButtonGroup,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
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

const FILTER_SIDEBAR_WIDTH = 220;
const AI_STRATEGY_PANEL_WIDTH = 420;
const RIGHT_SIDEBAR_WIDTH = 280;

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

  // Period filter
  const [selectedPeriod, setSelectedPeriod] = useState(null);

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
    setSelectedPeriod(null);
    setPage(1);
  };

  // Period filter handler
  const handlePeriodFilter = (days) => {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days);

    setFilters(prev => ({
      ...prev,
      date_from: fromDate.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    }));
    setSelectedPeriod(days);
    setPage(1);
  };

  // Fetch new articles from API
  const handleCollectArticles = async () => {
    try {
      setSnackbar({ open: true, message: '기사 수집을 시작합니다...', severity: 'info' });
      await collectArticles();
      setSnackbar({ open: true, message: '기사 수집이 완료되었습니다.', severity: 'success' });
      fetchArticles();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: '기사 수집에 실패했습니다.', severity: 'error' });
    }
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Top Header with Status Cards */}
      <Box sx={{ p: 2, pb: 1.5, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {isMobile && (
            <IconButton onClick={() => setMobileFilterOpen(true)} sx={{ mr: 1, color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h5" fontWeight={700} color="text.primary">
            AI 리스크 모니터링 & 대응
          </Typography>
        </Box>

        {/* Status Cards */}
        <RiskStatusCards stats={dashboardStats} onCardClick={handleCardClick} />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar - Filters (Desktop) */}
        {!isMobile && (
          <Box
            sx={{
              width: FILTER_SIDEBAR_WIDTH,
              flexShrink: 0,
              p: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
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
          sx={{ '& .MuiDrawer-paper': { width: FILTER_SIDEBAR_WIDTH, p: 2, bgcolor: 'background.paper' } }}
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

        {/* Center Content - News Feed + AI Strategy */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          {/* News Feed Section */}
          <Box
            sx={{
              flex: selectedArticle ? '0 0 45%' : 1,
              minWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'flex 0.3s ease'
            }}
          >
          {/* News Feed Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                AI 대응 뉴스 피드
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleCollectArticles}
                sx={{ fontSize: '12px', borderColor: 'divider', color: 'text.secondary' }}
              >
                기사 수집
              </Button>
            </Box>

            {/* Period Filter Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ButtonGroup variant="outlined" size="small">
                <Button
                  onClick={() => handlePeriodFilter(1)}
                  variant={selectedPeriod === 1 ? 'contained' : 'outlined'}
                  sx={{ fontSize: '11px', px: 1.5 }}
                >
                  1일
                </Button>
                <Button
                  onClick={() => handlePeriodFilter(7)}
                  variant={selectedPeriod === 7 ? 'contained' : 'outlined'}
                  sx={{ fontSize: '11px', px: 1.5 }}
                >
                  7일
                </Button>
                <Button
                  onClick={() => handlePeriodFilter(30)}
                  variant={selectedPeriod === 30 ? 'contained' : 'outlined'}
                  sx={{ fontSize: '11px', px: 1.5 }}
                >
                  30일
                </Button>
              </ButtonGroup>
              {selectedPeriod && (
                <Chip
                  label="초기화"
                  size="small"
                  onDelete={() => {
                    setFilters(prev => ({ ...prev, date_from: '', date_to: '' }));
                    setSelectedPeriod(null);
                  }}
                  sx={{ height: 24, fontSize: '11px' }}
                />
              )}
            </Box>
          </Box>

          {/* News Feed List */}
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
                      size="small"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

          {/* AI Strategy Panel - shown when article selected */}
          {!isMobile && selectedArticle && (
            <Box
              sx={{
                flex: '0 0 55%',
                minWidth: 350,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                overflow: 'auto'
              }}
            >
              <AIStrategyPanel
                article={selectedArticle}
                onClose={() => setSelectedArticle(null)}
                onActionItemToggle={handleActionItemToggle}
                onStatusChange={handleStatusChange}
                isAnalyzing={isAnalyzing}
              />
            </Box>
          )}
        </Box>

        {/* Right Sidebar - Alerts + Workflow (Desktop) - Fixed to right edge */}
        {!isMobile && (
          <Box
            sx={{
              width: RIGHT_SIDEBAR_WIDTH,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.default',
              borderLeft: '1px solid',
              borderColor: 'divider'
            }}
          >
            {/* Realtime Alerts */}
            <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
              <RealtimeAlerts
                alerts={alerts}
                onRefresh={fetchStats}
                onAlertClick={handleAlertClick}
              />
            </Box>

            {/* Team Workflow */}
            <Box sx={{ flex: 1, p: 2, pt: 0, overflow: 'hidden' }}>
              <TeamWorkflow workflowStats={workflowStats} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Mobile AI Strategy Drawer */}
      {isMobile && selectedArticle && (
        <Drawer
          anchor="right"
          open={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          sx={{ '& .MuiDrawer-paper': { width: '100%', maxWidth: 450, bgcolor: 'background.paper' } }}
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
