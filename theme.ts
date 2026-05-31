import { createTheme, alpha } from '@mui/material/styles'

const brandBlue = '#00518c'
const brandBlueDark = '#003e6b'
const brandBlueLight = '#e8f0ff'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandBlue,
      dark: brandBlueDark,
      light: '#4f8cff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4fc3f7',
      dark: '#039be5',
      light: '#b6ecff',
      contrastText: '#062743',
    },
    background: {
      default: '#f4f8ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#10233f',
      secondary: '#5c6f8a',
    },
    divider: '#d8e3f3',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #f7fbff 0%, #edf4ff 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 16px 40px rgba(17, 71, 163, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(brandBlue, 0.03),
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme

