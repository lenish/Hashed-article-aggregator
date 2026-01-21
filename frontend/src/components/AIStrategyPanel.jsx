import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Link,
  TextField,
  CircularProgress,
  Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const AIStrategyPanel = ({
  article,
  onClose,
  onActionItemToggle,
  onAddComment,
  onStatusChange,
  comments = [],
  isAnalyzing
}) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);

  if (!article) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography color="text.secondary">
          기사를 선택하면 AI 추천 대응 전략이 표시됩니다.
        </Typography>
      </Paper>
    );
  }

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment && onAddComment(article.id, newComment);
      setNewComment('');
    }
  };

  const getRiskConfig = (level) => {
    const configs = {
      red: { color: '#fca5a5', bgColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' },
      amber: { color: '#fcd34d', bgColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b' },
      green: { color: '#86efac', bgColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e' }
    };
    return configs[level] || configs.green;
  };

  const riskConfig = getRiskConfig(article.risk_level);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#fff' }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
            AI 추천 대응 전략
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {isAnalyzing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2, color: 'primary.light' }} />
            <Typography color="text.secondary">AI 분석 중...</Typography>
          </Box>
        ) : (
          <>
            {/* 리스크 레벨 표시 */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`Risk Level: ${article.risk_level?.toUpperCase()}`}
                sx={{
                  bgcolor: riskConfig.bgColor,
                  color: riskConfig.color,
                  fontWeight: 700,
                  border: `1px solid ${riskConfig.borderColor}`,
                  mb: 1
                }}
              />
              {article.risk_score > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  Score: {article.risk_score}/100
                </Typography>
              )}
            </Box>

            {/* 핵심 요약 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                핵심 요약
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  borderLeft: '3px solid #6366f1'
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  {article.ai_summary || article.description || '요약 정보가 없습니다. AI 분석을 실행하세요.'}
                </Typography>
              </Box>
            </Box>

            {/* 리스크 분석 */}
            {article.ai_risk_analysis && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                  <WarningAmberIcon sx={{ fontSize: 18, mr: 0.5, color: '#fcd34d' }} />
                  리스크 분석
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    {article.ai_risk_analysis}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* 실행 액션 아이템 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 18, mr: 0.5, color: '#86efac' }} />
                실행 액션 아이템
              </Typography>
              {article.action_items && article.action_items.length > 0 ? (
                <List dense sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                  {article.action_items.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{ py: 0.5 }}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          checked={item.checked || false}
                          onChange={() => onActionItemToggle && onActionItemToggle(article.id, index)}
                          sx={{
                            color: 'text.secondary',
                            '&.Mui-checked': { color: '#22c55e' }
                          }}
                        />
                      }
                    >
                      <ListItemText
                        primary={item.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? 'text.secondary' : 'text.primary'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  액션 아이템이 없습니다. AI 분석을 실행하세요.
                </Typography>
              )}
            </Box>

            {/* 유사 사례 */}
            {article.similar_cases && article.similar_cases.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                  <LinkIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.light' }} />
                  유사 사례
                </Typography>
                <List dense sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                  {article.similar_cases.map((caseItem, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Link href={caseItem.url} target="_blank" rel="noopener" sx={{ color: 'primary.light' }}>
                            {caseItem.title}
                          </Link>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider sx={{ my: 2, borderColor: 'divider' }} />

            {/* 댓글 섹션 */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 1
                }}
                onClick={() => setShowComments(!showComments)}
              >
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  Comment ({comments.length})
                </Typography>
                {showComments ? <ExpandLessIcon sx={{ color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
              </Box>

              <Collapse in={showComments}>
                {/* 댓글 목록 */}
                {comments.length > 0 ? (
                  <List dense sx={{ mb: 2 }}>
                    {comments.map((comment, index) => (
                      <ListItem key={index} sx={{ alignItems: 'flex-start', px: 0 }}>
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          {comment.author?.picture && (
                            <img
                              src={comment.author.picture}
                              alt={comment.author.name}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%'
                              }}
                            />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" fontWeight={600} color="text.primary">
                              {comment.author?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                              {comment.content}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    댓글이 없습니다.
                  </Typography>
                )}

                {/* 댓글 입력 */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                        '& fieldset': { borderColor: 'divider' }
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    sx={{ color: 'primary.light' }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Collapse>
            </Box>
          </>
        )}
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onStatusChange && onStatusChange(article.id, 'resolved')}
            disabled={article.status === 'resolved'}
            sx={{
              flex: 1,
              bgcolor: '#22c55e',
              '&:hover': { bgcolor: '#16a34a' },
              '&.Mui-disabled': { bgcolor: 'rgba(34, 197, 94, 0.3)', color: 'rgba(255,255,255,0.5)' }
            }}
          >
            대응 완료
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onStatusChange && onStatusChange(article.id, 'ignored')}
            disabled={article.status === 'ignored'}
            sx={{
              flex: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.secondary', bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            무시
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AIStrategyPanel;
