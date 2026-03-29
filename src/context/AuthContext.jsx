import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuth, getStoredUser, setAuth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = async (username, password) => {
    const data = await api.login({ username, password });
    setAuth(data);
    setUser({ token: data.token, username: data.username, role: data.role });
    return data;
  };

  const register = async (username, password) => {
    const data = await api.register({ username, password });
    setAuth(data);
    setUser({ token: data.token, username: data.username, role: data.role });
    return data;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  useEffect(() => {
    const onExpire = () => setUser(null);
    window.addEventListener('attendance:session-expired', onExpire);
    return () => window.removeEventListener('attendance:session-expired', onExpire);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'ADMIN',
      isStudent: user?.role === 'STUDENT',
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
