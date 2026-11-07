import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

/**
 * AuthProvider – wraps the app and provides user/token state,
 * plus login, register, and logout helpers.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount (or when token changes), verify the stored token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((data) => {
        setUser(data.user || data);
      })
      .catch(() => {
        // Token is invalid – clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, login, register, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume auth context.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
