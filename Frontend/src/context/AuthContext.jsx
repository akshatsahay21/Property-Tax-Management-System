import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount: load from sessionStorage first (tab-specific),
  // fall back to localStorage (so new tabs inherit an existing session)
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const storedUser  = sessionStorage.getItem('user')  || localStorage.getItem('user');

    if (storedToken && storedUser) {
      // Write into sessionStorage so this tab now owns its own copy
      sessionStorage.setItem('token', storedToken);
      sessionStorage.setItem('user', storedUser);
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    // sessionStorage is tab-isolated — each tab keeps its own session
    sessionStorage.setItem('token', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('role', userData.role);

    // localStorage acts as a "last logged-in" snapshot so brand-new
    // tabs can inherit the session without needing to log in again
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);

    if (userData.role === 'ward_officer' || userData.role === 'admin') {
      navigate('/officer');
    } else {
      navigate('/inspector');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
    localStorage.clear();
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context cleanly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
