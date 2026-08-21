import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, authStorage } from '../lib/api';
import type { ApiUser } from '../lib/api';
import { AuthContext } from './authContextValue';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(authStorage.user());
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authStorage.user();
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        setUser(currentUser);
        authStorage.set(localStorage.getItem('siteops.accessToken') ?? '', currentUser);
      } catch {
        authStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token: string, newUser: ApiUser) => {
    authStorage.set(token, newUser);
    setUser(newUser);
  };

  const logout = () => {
    authStorage.clear();
    queryClient.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
