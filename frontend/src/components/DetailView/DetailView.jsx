import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
  Chip,
  Avatar,
  Toolbar,
  AppBar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Message from '../Message/Message.jsx';
import { groupMessagesByDate } from '../../utils/logParser.jsx';
import { formatShortDate } from '../../utils/dateFormat.jsx';

// Styled components
const DetailContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
}));

const DateDivider = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(3, 0),
}));

function DetailView({ botName, userName, conversations, onBack }) {
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef(null);
  
  // Get messages for this conversation
  const messages = conversations[botName] && conversations[botName][userName]
    ? conversations[botName][userName]
    : [];
  
  // Group messages by date
  const messagesByDate = groupMessagesByDate(messages);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // If no conversation is selected, show a message
  if (!botName || !userName) {
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
            No conversation selected
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a conversation from the grid or list view to see the details.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // If the conversation doesn't exist, show a message
  if (!conversations[botName] || !conversations[botName][userName]) {
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
            Conversation not found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The selected conversation between {botName} and {userName} could not be found.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  return (
    <DetailContainer elevation={2}>
      {/* Conversation header */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.dark' }}>
                  <SmartToyIcon />
                </Avatar>
              }
              label={botName}
              color="secondary"
              sx={{ mr: 1 }}
            />
            <Typography variant="h6" sx={{ mx: 1 }}>
              &lt;&gt;
            </Typography>
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: 'primary.dark' }}>
                  <PersonIcon />
                </Avatar>
              }
              label={userName}
              color="primary"
            />
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="body2" color="text.secondary">
            {messages.length} messages
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Divider />
      
      {/* Messages */}
      <MessagesContainer>
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <React.Fragment key={date}>
            <DateDivider>
              <Divider sx={{ flexGrow: 1, mr: 2 }} />
              <Chip label={formatShortDate(date)} size="small" />
              <Divider sx={{ flexGrow: 1, ml: 2 }} />
            </DateDivider>
            
            {dateMessages.map((message, index) => (
              <Message
                key={`${message.timestamp}-${index}`}
                message={message}
                botName={botName}
                userName={userName}
              />
            ))}
          </React.Fragment>
        ))}
        
        {/* Empty div for auto-scrolling to bottom */}
        <div ref={messagesEndRef} />
      </MessagesContainer>
    </DetailContainer>
  );
}

export default DetailView;