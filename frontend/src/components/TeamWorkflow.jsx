import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';

const TeamWorkflow = ({ workflowStats, users = [] }) => {
  const byAssignee = workflowStats?.by_assignee || [];
  const unassignedCount = workflowStats?.unassigned_count || 0;

  const totalAssigned = byAssignee.reduce((sum, item) => sum + item.assigned_count, 0);
  const totalTasks = totalAssigned + unassignedCount;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <GroupIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          팀 워크플로우
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            전체 진행 중 ({totalTasks}건)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            미할당: {unassignedCount}건
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalTasks > 0 ? (totalAssigned / totalTasks) * 100 : 0}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
            }
          }}
        />
      </Box>

      {/* Assignee List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {byAssignee.length === 0 && unassignedCount === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              진행 중인 작업이 없습니다.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {/* 미할당 */}
            {unassignedCount > 0 && (
              <>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#e0e0e0', width: 36, height: 36 }}>
                      <AssignmentIcon sx={{ fontSize: 18, color: '#666' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        미할당
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        담당자 지정 필요
                      </Typography>
                    }
                  />
                  <Chip
                    label={`${unassignedCount}건`}
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 600 }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </>
            )}

            {/* 담당자별 */}
            {byAssignee.map((item, index) => (
              <React.Fragment key={item.user_id}>
                <ListItem>
                  <ListItemAvatar>
                    {item.picture ? (
                      <Avatar
                        src={item.picture}
                        alt={item.name}
                        sx={{ width: 36, height: 36 }}
                      />
                    ) : (
                      <Avatar sx={{ bgcolor: '#667eea', width: 36, height: 36 }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={totalAssigned > 0 ? (item.assigned_count / totalAssigned) * 100 : 0}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: '#e0e0e0',
                            width: '80%'
                          }}
                        />
                      </Box>
                    }
                  />
                  <Chip
                    label={`${item.assigned_count}건`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </ListItem>
                {index < byAssignee.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default TeamWorkflow;
