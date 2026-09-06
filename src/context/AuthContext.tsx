import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthState, User } from '../types';
import { useNotification } from './NotificationContext';
import api from '../services/api';

interface AuthContextProps extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const { showToast } = useNotification();

  const logout = useCallback(() => {
    localStorage.removeItem('gf_auth_token');
    localStorage.removeItem('gf_auth_user');
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    showToast('Logged out successfully.', 'info');
  }, [showToast]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('gf_auth_token');
      const storedUser = localStorage.getItem('gf_auth_user');

      if (token && storedUser) {
        try {
          setState({
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            loading: false,
          });

          // Verify with Backend if it's not a mock token
          if (!token.startsWith('mock_')) {
            try {
              const response = await api.get('/auth/me');
              const freshUser = response.data;
              localStorage.setItem('gf_auth_user', JSON.stringify(freshUser));
              setState({
                user: freshUser,
                isAuthenticated: true,
                loading: false,
              });
            } catch (err: any) {
              if (err.response?.status === 401) {
                logout();
              }
            }
          }
        } catch (e) {
          logout();
        }
      } else {
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    };

    initializeAuth();
  }, [logout]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setState({ user: null, isAuthenticated: false, loading: false });
    };

    window.addEventListener('gf-auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('gf-auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Call actual backend authentication
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('gf_auth_token', token);
      localStorage.setItem('gf_auth_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        loading: false,
      });

      showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    } catch (error: any) {
      // Offline fallback: check if it's a network error (server is not reachable)
      const isNetworkError = !error.response;
      if (isNetworkError) {
        console.warn("Backend not detected. Falling back to client-side mock authentication.");

        const mockRoles: Record<string, 'admin' | 'superadmin' | 'physiotherapist' | 'doctor' | 'receptionist' | 'accountant' | 'patient'> = {
          'admin@gloryflorence.com': 'admin',
          'superadmin@gloryflorence.com': 'superadmin',
          'physio@gloryflorence.com': 'physiotherapist',
          'doctor@gloryflorence.com': 'doctor',
          'receptionist@gloryflorence.com': 'receptionist',
          'accountant@gloryflorence.com': 'accountant',
          'patient@gloryflorence.com': 'patient',
        };

        const emailLower = email.toLowerCase();
        if (mockRoles[emailLower] && password === 'admin123') {
          const role = mockRoles[emailLower];
          const mockUser: User = {
            id: `usr_${role}`,
            email: emailLower,
            name: `Dr. Glory ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            role,
          };

          localStorage.setItem('gf_auth_token', `mock_jwt_token_for_gf_${role}`);
          localStorage.setItem('gf_auth_user', JSON.stringify(mockUser));

          setState({
            user: mockUser,
            isAuthenticated: true,
            loading: false,
          });

          showToast(`[Offline Mode] Signed in as ${mockUser.name} (${role})`, 'success');
          return true;
        }
      }

      setState((prev) => ({ ...prev, loading: false }));
      // Toast notification is handled by Axios response interceptor
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
