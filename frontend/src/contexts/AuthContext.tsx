'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, RoleName } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: RoleName[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hrms_token');
    const storedUser = localStorage.getItem('hrms_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('hrms_token');
        localStorage.removeItem('hrms_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem('hrms_token', result.token);
    localStorage.setItem('hrms_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const hasRole = useCallback(
    (...roles: RoleName[]) => {
      if (!user?.role) return false;
      return roles.includes(user.role as RoleName);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
