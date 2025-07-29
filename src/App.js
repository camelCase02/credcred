import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { UserProvider } from './contexts/UserContext';
import blueTheme from './theme/theme';
import AppRoutes from './routes';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={blueTheme}>
        <CssBaseline />
        <Router>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
