import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, storeCsrfToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((res) => {
        storeCsrfToken(res.data.csrf_token);
        setUser(res.data);
      })
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    storeCsrfToken(res.data.csrf_token);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // best-effort: clear local state even if server call fails
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
