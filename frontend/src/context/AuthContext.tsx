import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse } from '../services/authService';
import axios from 'axios';

interface AuthContextType {
  user: AuthResponse | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    if (!user || !user.token || !user.refreshToken) return;

    try {
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      
      // Refresh 10 seconds before the token expires
      const timeUntilRefresh = Math.max((exp - now) - 10000, 1000); 

      const timeoutId = setTimeout(async () => {
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken: user.refreshToken });
          const { token, refreshToken } = response.data;
          
          const updatedUser = { ...user, token, refreshToken };
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (error) {
          console.error("Silent refresh failed", error);
        }
      }, timeUntilRefresh);

      return () => clearTimeout(timeoutId);
    } catch (e) {
      // Invalid token format
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
