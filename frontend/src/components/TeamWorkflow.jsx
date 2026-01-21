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
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
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
          gap: 1
        }}
      >
        <GroupIcon sx={{ color: 'primary.light' }} />
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Team Workflow
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            In Progress ({totalTasks})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Unassigned: {unassignedCount}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalTasks > 0 ? (totalAssigned / totalTasks) * 100 : 0}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
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
              No tasks in progress.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {/* Unassigned */}
            {unassignedCount > 0 && (
              <>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', width: 36, height: 36 }}>
                      <AssignmentIcon sx={{ fontSize: 18, color: '#fcd34d' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        Unassigned
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Needs assignment
                      </Typography>
                    }
                  />
                  <Chip
                    label={unassignedCount}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'rgba(245, 158, 11, 0.2)',
                      color: '#fcd34d',
                      border: '1px solid #f59e0b'
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" sx={{ borderColor: 'divider' }} />
              </>
            )}

            {/* By assignee */}
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
                      <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36 }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500} color="text.primary">
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
                            bgcolor: 'rgba(255,255,255,0.1)',
                            width: '80%'
                          }}
                        />
                      </Box>
                    }
                  />
                  <Chip
                    label={item.assigned_count}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'transparent',
                      color: 'primary.light',
                      border: '1px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                </ListItem>
                {index < byAssignee.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ borderColor: 'divider' }} />
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
