import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { formatDateTime } from '../../utils/dateFormat.jsx';

// Styled components
const UserMessagePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  maxWidth: '80%',
  borderRadius: '16px 16px 4px 16px',
}));

const BotMessagePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  maxWidth: '80%',
  borderRadius: '16px 16px 16px 4px',
}));

const BotEntryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  border: `1px solid ${theme.palette.divider}`,
  maxWidth: '80%',
  borderRadius: '16px',
  textAlign: 'center',
}));

function Message({ message, botName, userName }) {
  const { timestamp, sender, content, isEntry } = message;
  
  // Format the content for display
  const formatContent = (content) => {
    // Split content into paragraphs
    return content.split('\n').map((paragraph, index) => (
      paragraph ? (
        <Typography key={index} variant="body1" paragraph={index < content.split('\n').length - 1}>
          {paragraph}
        </Typography>
      ) : (
        <br key={index} />
      )
    ));
  };
  
  // Render a bot entry message
  if (isEntry) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <BotEntryPaper elevation={0}>
          <Typography variant="body2" color="text.secondary">
            <b>{botName}</b> has entered the chat
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(timestamp)}
          </Typography>
        </BotEntryPaper>
      </Box>
    );
  }
  
  // Render a user message
  if (sender === 'user') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ maxWidth: '80%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {formatDateTime(timestamp)}
            </Typography>
            <Chip
              label={userName}
              size="small"
              color="primary"
              avatar={<Avatar sx={{ bgcolor: 'primary.dark' }}><PersonIcon /></Avatar>}
            />
          </Box>
          <UserMessagePaper elevation={1}>
            {formatContent(content)}
          </UserMessagePaper>
        </Box>
      </Box>
    );
  }
  
  // Render a bot message
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
      <Box sx={{ maxWidth: '80%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 0.5 }}>
          <Chip
            label={botName}
            size="small"
            color="secondary"
            avatar={<Avatar sx={{ bgcolor: 'secondary.dark' }}><SmartToyIcon /></Avatar>}
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(timestamp)}
          </Typography>
        </Box>
        <BotMessagePaper elevation={1}>
          {formatContent(content)}
        </BotMessagePaper>
      </Box>
    </Box>
  );
}

export default Message;