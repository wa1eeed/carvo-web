import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from './api';

type User = { id: number; email: string; name?: string; role: string };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get<{ user: User }>('/api/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
};

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
}
