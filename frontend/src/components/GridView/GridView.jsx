import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import BotCard from '../BotCard/BotCard';

function GridView({ conversations, onSelectConversation, filters }) {
  // Get bot names
  const botNames = Object.keys(conversations);
  
  // Filter bots based on filters
  const filteredBots = botNames.filter(botName => {
    // Filter by bot name
    if (filters.botFilter && !botName.toLowerCase().includes(filters.botFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by search query (across bot names and user names)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      
      // Check if bot name matches
      if (botName.toLowerCase().includes(query)) {
        return true;
      }
      
      // Check if any user name matches
      const users = Object.keys(conversations[botName]);
      const userMatches = users.some(userName => 
        userName.toLowerCase().includes(query)
      );
      
      if (userMatches) {
        return true;
      }
      
      // Check if any message content matches
      const messageMatches = users.some(userName => {
        const userMessages = conversations[botName][userName];
        return userMessages.some(message => 
          message.content.toLowerCase().includes(query)
        );
      });
      
      if (!messageMatches) {
        return false;
      }
    }
    
    return true;
  });
  
  // If no bots match the filters, show a message
  if (filteredBots.length === 0) {
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
            {botNames.length === 0 
              ? 'There are no active bots or conversations to display.'
              : 'No conversations match the current filters. Try adjusting your search criteria.'}
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {filteredBots.map(botName => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={botName}>
          <BotCard
            botName={botName}
            conversations={conversations[botName]}
            onSelectConversation={onSelectConversation}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default GridView;