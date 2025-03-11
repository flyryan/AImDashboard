import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Box,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HomeIcon from '@mui/icons-material/Home';
import { formatRelativeTime } from '../../utils/dateFormat.jsx';

// Drawer width
const drawerWidth = 240;

// Styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    marginTop: 64, // Height of AppBar
    height: 'calc(100% - 64px)',
  },
}));

function Sidebar({
  open,
  bots,
  conversations,
  selectedBot,
  selectedUser,
  onBotSelect,
  onUserSelect,
  onHomeSelect,
  filters
}) {
  // State for expanded bots
  const [expandedBots, setExpandedBots] = useState({});
  const [searchText, setSearchText] = useState('');
  
  // Toggle bot expansion
  const toggleBotExpansion = (botName) => {
    setExpandedBots(prev => ({
      ...prev,
      [botName]: !prev[botName]
    }));
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchText('');
  };
  
  // Filter bots based on search text
  const filteredBots = bots.filter(botName => 
    botName.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // Get the last message timestamp for a user
  const getLastActivityTime = (botName, userName) => {
    if (!conversations[botName] || !conversations[botName][userName]) {
      return null;
    }
    
    const messages = conversations[botName][userName];
    if (messages.length === 0) {
      return null;
    }
    
    return messages[messages.length - 1].timestamp;
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
  
  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search bots..."
          value={searchText}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchText && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      
      <Divider />
      
      <List component="nav">
        <ListItemButton
          onClick={onHomeSelect}
          selected={!selectedBot}
        >
          <ListItemIcon>
            <HomeIcon color={!selectedBot ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        
        <Divider />
        
        {filteredBots.length === 0 ? (
          <ListItem>
            <Typography variant="body2" color="text.secondary">
              No bots found
            </Typography>
          </ListItem>
        ) : (
          filteredBots.map(botName => {
            const users = conversations[botName] ? Object.keys(conversations[botName]) : [];
            const isExpanded = expandedBots[botName] || false;
            const isSelected = selectedBot === botName;
            
            return (
              <React.Fragment key={botName}>
                <ListItemButton
                  selected={isSelected && !isExpanded}
                  onClick={() => {
                    if (users.length > 0) {
                      toggleBotExpansion(botName);
                    }
                    onBotSelect(botName);
                  }}
                >
                  <ListItemIcon>
                    <SmartToyIcon color={isSelected ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={botName} 
                    secondary={`${users.length} user${users.length !== 1 ? 's' : ''}`}
                  />
                  {users.length > 0 && (
                    isExpanded ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
                
                {users.length > 0 && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {users.map(userName => {
                        const lastActivity = getLastActivityTime(botName, userName);
                        const activityLevel = getActivityLevel(lastActivity);
                        const activityColor = getActivityColor(activityLevel);
                        
                        return (
                          <ListItemButton
                            key={userName}
                            sx={{ pl: 4 }}
                            selected={isSelected && selectedBot === botName && userName === selectedUser}
                            onClick={() => onUserSelect(botName, userName)}
                          >
                            <ListItemIcon>
                              <Badge
                                variant="dot"
                                color={activityColor}
                                invisible={activityLevel === 'none'}
                              >
                                <PersonIcon fontSize="small" />
                              </Badge>
                            </ListItemIcon>
                            <ListItemText
                              primary={userName}
                              secondary={lastActivity ? formatRelativeTime(lastActivity) : 'No activity'}
                              primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true
                              }}
                              secondaryTypographyProps={{
                                variant: 'caption',
                                noWrap: true
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })
        )}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {filteredBots.length} bots, {Object.values(conversations).reduce((count, botConversations) => count + Object.keys(botConversations).length, 0)} conversations
        </Typography>
      </Box>
    </StyledDrawer>
  );
}

export default Sidebar;