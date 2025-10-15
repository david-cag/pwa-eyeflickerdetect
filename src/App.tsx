import React from 'react';
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import BlinkDetector from './components/BlinkDetector';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography 
            variant="h5" 
            align="center"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600,
              mb: { xs: 0.5, sm: 1 }
            }}
          >
            Eye Flicker Detect
          </Typography>
          <Typography 
            align="center" 
            color="textSecondary"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              mb: { xs: 1, sm: 1 }
            }}
          >
            Monitor your blink frequency in real-time
          </Typography>
          <BlinkDetector />
        </Container>
      </Box>
    </ThemeProvider>
  );
} export default App;
