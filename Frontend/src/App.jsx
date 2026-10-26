import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';

/**
 * App - Root component
 * BrowserRouter > AuthProvider > AppRoutes
 * AuthProvider must be inside BrowserRouter so that useNavigate works in AuthContext
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
