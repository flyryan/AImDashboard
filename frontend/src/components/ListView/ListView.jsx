import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
  Chip,
  Avatar,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatRelativeTime, formatDateTime } from '../../utils/dateFormat.jsx';

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function ListView({ conversations, onSelectConversation, filters }) {
  // State for sorting
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('lastActive');
  
  // Create a flat list of all conversations
  const flatConversations = [];
  
  Object.entries(conversations).forEach(([botName, botConversations]) => {
    Object.entries(botConversations).forEach(([userName, messages]) => {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        flatConversations.push({
          botName,
          userName,
          lastMessage: lastMessage.content,
          lastActive: lastMessage.timestamp,
          messageCount: messages.length,
          sender: lastMessage.sender
        });
      }
    });
  });
  
  // Filter conversations based on filters
  const filteredConversations = flatConversations.filter(conversation => {
    // Filter by bot name
    if (filters.botFilter && !conversation.botName.toLowerCase().includes(filters.botFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by user name
    if (filters.userFilter && !conversation.userName.toLowerCase().includes(filters.userFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      
      // Check if bot name, user name, or last message matches
      if (
        !conversation.botName.toLowerCase().includes(query) &&
        !conversation.userName.toLowerCase().includes(query) &&
        !conversation.lastMessage.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    let comparison = 0;
    
    switch (orderBy) {
      case 'botName':
        comparison = a.botName.localeCompare(b.botName);
        break;
      case 'userName':
        comparison = a.userName.localeCompare(b.userName);
        break;
      case 'lastActive':
        comparison = new Date(b.lastActive) - new Date(a.lastActive);
        break;
      case 'messageCount':
        comparison = b.messageCount - a.messageCount;
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Get activity level based on timestamp
  const getActivityLevel = (timestamp) => {
    if (!timestamp) return 'none';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMinutes = (now - messageTime) / (1000 * 60);
    
    if (diffMinutes < 5) return 'high';
    if (diffMinutes < 30) return 'medium';
    return 'low';
  };
  
  // Get activity color based on level
  const getActivityColor = (level) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  // If no conversations match the filters, show a message
  if (sortedConversations.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          p: 3
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 500
          }}
        >
          <Typography variant="h6" gutterBottom>
            No conversations found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {Object.keys(conversations).length === 0 
              ? 'There are no active bots or conversations to display.'
              : 'No conversations match the current filters. Try adjusting your search criteria.'}
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="conversations table">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'botName'}
                direction={orderBy === 'botName' ? order : 'asc'}
                onClick={() => handleRequestSort('botName')}
              >
                Bot
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'userName'}
                direction={orderBy === 'userName' ? order : 'asc'}
                onClick={() => handleRequestSort('userName')}
              >
                User
              </TableSortLabel>
            </TableCell>
            <TableCell>Last Message</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'lastActive'}
                direction={orderBy === 'lastActive' ? order : 'asc'}
                onClick={() => handleRequestSort('lastActive')}
              >
                Last Active
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'messageCount'}
                direction={orderBy === 'messageCount' ? order : 'asc'}
                onClick={() => handleRequestSort('messageCount')}
              >
                Messages
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedConversations.map((conversation, index) => {
            const activityLevel = getActivityLevel(conversation.lastActive);
            const activityColor = getActivityColor(activityLevel);
            
            return (
              <StyledTableRow
                key={`${conversation.botName}-${conversation.userName}`}
                hover
                onClick={() => onSelectConversation(conversation.botName, conversation.userName)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 30, height: 30 }}>
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">{conversation.botName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge
                      variant="dot"
                      color={activityColor}
                      invisible={activityLevel === 'none'}
                      sx={{ mr: 1 }}
                    >
                      <Avatar sx={{ width: 30, height: 30 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    </Badge>
                    <Typography variant="body2">{conversation.userName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Chip
                      size="small"
                      label={conversation.sender === 'user' ? 'User' : 'Bot'}
                      color={conversation.sender === 'user' ? 'primary' : 'secondary'}
                      sx={{ mr: 1, height: 20 }}
                    />
                    {conversation.lastMessage}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={formatDateTime(conversation.lastActive)}>
                    <Typography variant="body2">
                      {formatRelativeTime(conversation.lastActive)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={conversation.messageCount}
                    size="small"
                    color={conversation.messageCount > 10 ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Conversation">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConversation(conversation.botName, conversation.userName);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ListView;