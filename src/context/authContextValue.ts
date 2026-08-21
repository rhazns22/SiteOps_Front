import { createContext } from 'react';
import type { ApiUser } from '../lib/api';

export interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  login: (token: string, user: ApiUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {}
});
