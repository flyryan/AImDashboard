import { createTheme } from '@mui/material/styles';

// Create a custom theme using Trend Micro colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D71920', // Trend Red
      light: '#E67C60', // Trend Red 60%
      dark: '#6F0000', // Guardian Red
    },
    secondary: {
      main: '#005295', // Dark Blue
      light: '#56A0D3', // Light Blue
      dark: '#2CAFA4', // Teal
    },
    background: {
      default: '#1E1E1E', // Slightly lighter than black for better contrast
      paper: '#2D2D2D', // Darker gray for cards and surfaces
    },
    text: {
      primary: '#FFFFFF', // Pure white for primary text
      secondary: '#E6E7E8', // Gray 10 for secondary text
      disabled: '#BCBEC0', // Gray 30 for disabled text
    },
    error: {
      main: '#D71920', // Trend Red
    },
    warning: {
      main: '#FFDE6C', // Warning Yellow
    },
    info: {
      main: '#56A0D3', // Light Blue
    },
    success: {
      main: '#73C167', // Success Green
    },
    grey: {
      100: '#E6E7E8', // Gray 10
      200: '#D1D3D4', // Gray 20
      300: '#BCBEC0', // Gray 30
      400: '#A7A9AC', // Gray 40
      500: '#939598', // Gray 50
      600: '#808285', // Gray 60
      700: '#6D6E71', // Gray 70
      800: '#58595B', // Gray 80
      900: '#414042', // Gray 90
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#808285 #414042',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: '#414042',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            backgroundColor: '#808285',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#A7A9AC',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderBottom: '1px solid #414042',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E1E1E',
          borderRight: '1px solid #414042',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D2D2D',
          border: '1px solid #414042',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(215, 25, 32, 0.08)', // Trend Red with opacity
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(215, 25, 32, 0.16)', // Trend Red with higher opacity
            '&:hover': {
              backgroundColor: 'rgba(215, 25, 32, 0.24)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#414042',
        },
      },
    },
  },
});

export default theme;