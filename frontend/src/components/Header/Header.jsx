import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  InputBase,
  alpha,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterListIcon from '@mui/icons-material/FilterList';
import LogoutIcon from '@mui/icons-material/Logout';
import { throttle } from '../../utils/throttle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

function Header({
  onSidebarToggle,
  viewType,
  onViewChange,
  botCount,
  userCount,
  filters,
  onFilterChange
}) {
  // Get auth context for logout
  const { logout } = useAuth();
  
  // State for menus
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  // Handle filter menu open/close
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  
  // Handle view change
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      onViewChange(newView);
    }
  };
  
  // Handle search input change with throttling
  const handleSearchChange = throttle((event) => {
    onFilterChange('searchQuery', event.target.value);
  }, 300);
  
  // Handle activity filter change
  const handleActivityFilterChange = (value) => {
    onFilterChange('activityFilter', value);
    handleFilterMenuClose();
  };
  
  // Handle time filter change
  const handleTimeFilterChange = (value) => {
    onFilterChange('timeFilter', value);
    handleFilterMenuClose();
  };
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Sidebar toggle button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Dashboard title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          AI-Spy Dashboard
        </Typography>
        
        {/* Search bar */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search conversations…"
            inputProps={{ 'aria-label': 'search' }}
            onChange={handleSearchChange}
            defaultValue={filters.searchQuery}
          />
        </Search>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* View toggle */}
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          sx={{ mr: 2, bgcolor: 'background.paper' }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <Tooltip title="Grid View">
              <ViewModuleIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <Tooltip title="List View">
              <ViewListIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        
        {/* Stats chips */}
        <Chip
          label={`${botCount} Bots`}
          color="primary"
          size="small"
          sx={{
            mr: 1,
            color: '#FFFFFF',
            '& .MuiChip-label': {
              fontWeight: 500
            }
          }}
        />
        <Chip
          label={`${userCount} Users`}
          color="secondary"
          size="small"
          sx={{
            mr: 2,
            color: '#FFFFFF',
            '& .MuiChip-label': {
              fontWeight: 500
            }
          }}
        />
        
        {/* Filter button */}
        <Tooltip title="Filter">
          <IconButton
            color="inherit"
            onClick={handleFilterMenuOpen}
            aria-controls="filter-menu"
            aria-haspopup="true"
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        
        {/* Logout button */}
        <Tooltip title="Logout">
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        </Tooltip>
        
        {/* Filter menu */}
        <Menu
          id="filter-menu"
          anchorEl={filterAnchorEl}
          keepMounted
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterMenuClose}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Activity</Typography>
          </MenuItem>
          <MenuItem
            selected={filters.activityFilter === 'all'}
            onClick={() => handleActivityFilterChange('all')}
          >
            All
          </MenuItem>
          <MenuItem
            selected={filters.activityFilter === 'active'}
            onClick={() => handleActivityFilterChange('active')}
          >
            Active
          </MenuItem>
          <MenuItem
            selected={filters.activityFilter === 'idle'}
            onClick={() => handleActivityFilterChange('idle')}
          >
            Idle
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="subtitle2">Time Range</Typography>
          </MenuItem>
          <MenuItem
            selected={filters.timeFilter === 'all'}
            onClick={() => handleTimeFilterChange('all')}
          >
            All Time
          </MenuItem>
          <MenuItem
            selected={filters.timeFilter === 'today'}
            onClick={() => handleTimeFilterChange('today')}
          >
            Today
          </MenuItem>
          <MenuItem
            selected={filters.timeFilter === 'week'}
            onClick={() => handleTimeFilterChange('week')}
          >
            This Week
          </MenuItem>
          <MenuItem
            selected={filters.timeFilter === 'custom'}
            onClick={() => handleTimeFilterChange('custom')}
          >
            Custom Range...
          </MenuItem>
        </Menu>
        
      </Toolbar>
    </AppBar>
  );
}

export default Header;