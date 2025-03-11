import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Collapse,
  Box,
  Chip,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { formatRelativeTime } from '../../utils/dateFormat.jsx';

// Styled components
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function BotCard({ botName, conversations, onSelectConversation }) {
  const [expanded, setExpanded] = useState(false);
  
  // Get users for this bot
  const users = Object.keys(conversations);
  
  // Sort users by last activity
  const sortedUsers = [...users].sort((a, b) => {
    const aMessages = conversations[a];
    const bMessages = conversations[b];
    
    if (!aMessages.length) return 1;
    if (!bMessages.length) return -1;
    
    const aLastMessage = aMessages[aMessages.length - 1];
    const bLastMessage = bMessages[bMessages.length - 1];
    
    return new Date(bLastMessage.timestamp) - new Date(aLastMessage.timestamp);
  });
  
  // Get the last message for a user
  const getLastMessage = (userName) => {
    const messages = conversations[userName];
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
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
  
  // Handle expand click
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Determine how many users to show initially
  const initialUsers = sortedUsers.slice(0, 2);
  const remainingUsers = sortedUsers.slice(2);
  const hasMoreUsers = remainingUsers.length > 0;
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <SmartToyIcon />
          </Avatar>
        }
        title={botName}
        subheader={`${users.length} user${users.length !== 1 ? 's' : ''}`}
        action={
          hasMoreUsers && (
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          )
        }
      />
      
      <Divider />
      
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <List disablePadding>
          {initialUsers.map(userName => {
            const lastMessage = getLastMessage(userName);
            const lastActivity = lastMessage ? lastMessage.timestamp : null;
            const activityLevel = getActivityLevel(lastActivity);
            const activityColor = getActivityColor(activityLevel);
            
            return (
              <ListItem
                key={userName}
                button
                divider
                onClick={() => onSelectConversation(botName, userName)}
              >
                <ListItemAvatar>
                  <Badge
                    variant="dot"
                    color={activityColor}
                    invisible={activityLevel === 'none'}
                  >
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={userName}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: 'inline',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                      >
                        {lastMessage ? (
                          lastMessage.sender === 'user' ? (
                            `${userName}: ${lastMessage.content}`
                          ) : (
                            `Bot: ${lastMessage.content}`
                          )
                        ) : (
                          'No messages'
                        )}
                      </Typography>
                      <br />
                      {lastActivity && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatRelativeTime(lastActivity)}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    noWrap: true
                  }}
                />
              </ListItem>
            );
          })}
        </List>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {remainingUsers.map(userName => {
              const lastMessage = getLastMessage(userName);
              const lastActivity = lastMessage ? lastMessage.timestamp : null;
              const activityLevel = getActivityLevel(lastActivity);
              const activityColor = getActivityColor(activityLevel);
              
              return (
                <ListItem
                  key={userName}
                  button
                  divider
                  onClick={() => onSelectConversation(botName, userName)}
                >
                  <ListItemAvatar>
                    <Badge
                      variant="dot"
                      color={activityColor}
                      invisible={activityLevel === 'none'}
                    >
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={userName}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'inline',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                          }}
                        >
                          {lastMessage ? (
                            lastMessage.sender === 'user' ? (
                              `${userName}: ${lastMessage.content}`
                            ) : (
                              `Bot: ${lastMessage.content}`
                            )
                          ) : (
                            'No messages'
                          )}
                        </Typography>
                        <br />
                        {lastActivity && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            {formatRelativeTime(lastActivity)}
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                    primaryTypographyProps={{
                      variant: 'subtitle2',
                      noWrap: true
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
        
        {!expanded && hasMoreUsers && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Chip
              label={`+${remainingUsers.length} more user${remainingUsers.length !== 1 ? 's' : ''}`}
              size="small"
              onClick={handleExpandClick}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default BotCard;