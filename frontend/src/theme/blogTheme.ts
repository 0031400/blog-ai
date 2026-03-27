import { createTheme } from '@mui/material'

export const blogTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#174c3c' },
    secondary: { main: '#c7672d' },
    background: { default: '#f4efe6', paper: 'rgba(255,255,255,0.72)' },
  },
  typography: {
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    h1: { fontWeight: 700, letterSpacing: '-0.04em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h4: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 24 },
})
