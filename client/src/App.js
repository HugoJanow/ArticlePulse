import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import HomePage from './pages/HomePage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ProfilePage from './pages/ProfilePage';
import ArticleTest from './ArticleTest';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import PurchaseDebug from './components/PurchaseDebug';

// Context Providers
import { Web3Provider } from './context/Web3Context';
import { ArticleProvider } from './context/ArticleContext';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Web3Provider>
          <ArticleProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/articles" element={<ArticleListPage />} />
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/test" element={<ArticleTest />} />
                <Route path="/debug" element={<PurchaseDebug />} />
              </Routes>
            </Router>
          </ArticleProvider>
        </Web3Provider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;