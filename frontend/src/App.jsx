import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, CircularProgress, Typography, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme.js';
import Header from './components/Header/Header.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import GridView from './components/GridView/GridView.jsx';
import ListView from './components/ListView/ListView.jsx';
import DetailView from './components/DetailView/DetailView.jsx';
import Login from './components/Login/Login.jsx';
import { useSocket, useConversations } from './hooks/useSocket.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// View types
const VIEW_TYPES = {
  GRID: 'grid',
  LIST: 'list',
  DETAIL: 'detail'
};

// Main App component wrapped with AuthProvider
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// App content with authentication check
function AppContent() {
  const { isAuthenticated } = useAuth();
  const { isConnected, lastError, reconnect } = useSocket();
  const { conversations, getBots, getActiveBotCount, getActiveUserCount } = useConversations();
  
  // State
  const [viewType, setViewType] = useState(VIEW_TYPES.GRID);
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    botFilter: '',
    userFilter: '',
    activityFilter: 'all', // 'all', 'active', 'idle'
    timeFilter: 'all', // 'all', 'today', 'week', 'custom'
    searchQuery: ''
  });
  
  // Effect to handle initial loading
  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      setIsLoading(false);
    }
    
    // Set loading to false after a timeout even if no data is received
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [conversations]);
  
  // Effect to set initial selected bot
  useEffect(() => {
    if (!selectedBot && Object.keys(conversations).length > 0) {
      setSelectedBot(Object.keys(conversations)[0]);
    }
  }, [conversations, selectedBot]);
  
  // Handle view change
  const handleViewChange = (newView) => {
    setViewType(newView);
  };
  
  // Handle bot selection
  const handleBotSelect = (botName) => {
    setSelectedBot(botName);
    if (viewType === VIEW_TYPES.DETAIL) {
      setSelectedUser(null);
    }
  };
  
  // Handle user selection
  const handleUserSelect = (botName, userName) => {
    setSelectedBot(botName);
    setSelectedUser(userName);
    setViewType(VIEW_TYPES.DETAIL);
  };

  // Handle home selection
  const handleHomeSelect = () => {
    setSelectedBot(null);
    setSelectedUser(null);
    setViewType(VIEW_TYPES.GRID);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }
  
  // Render main content based on view type
  const renderContent = () => {
    switch (viewType) {
      case VIEW_TYPES.GRID:
        return (
          <GridView
            conversations={conversations}
            onSelectConversation={handleUserSelect}
            filters={filters}
          />
        );
      case VIEW_TYPES.LIST:
        return (
          <ListView
            conversations={conversations}
            onSelectConversation={handleUserSelect}
            filters={filters}
          />
        );
      case VIEW_TYPES.DETAIL:
        return (
          <DetailView
            botName={selectedBot}
            userName={selectedUser}
            conversations={conversations}
            onBack={() => setViewType(VIEW_TYPES.GRID)}
          />
        );
      default:
        return null;
    }
  };
  
  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login />
      </ThemeProvider>
    );
  }

  // If authenticated, show dashboard
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <CssBaseline />
        
        {/* Header */}
        <Header
          onSidebarToggle={handleSidebarToggle}
          viewType={viewType}
          onViewChange={handleViewChange}
          botCount={getActiveBotCount()}
          userCount={getActiveUserCount()}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        {/* Sidebar */}
        <Sidebar
          open={isSidebarOpen}
          bots={getBots()}
          conversations={conversations}
          selectedBot={selectedBot}
          selectedUser={selectedUser}
          onBotSelect={handleBotSelect}
          onUserSelect={handleUserSelect}
          onHomeSelect={handleHomeSelect}
          filters={filters}
        />
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Below the header
            height: 'calc(100vh - 64px)', // Full height minus header
            overflow: 'auto'
          }}
        >
          {/* Connection error alert */}
          {!isConnected && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <button onClick={reconnect}>
                  Reconnect
                </button>
              }
            >
              Connection lost. {lastError || 'Attempting to reconnect...'}
            </Alert>
          )}
          
          {/* Main content based on view type */}
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AppWithAuth;