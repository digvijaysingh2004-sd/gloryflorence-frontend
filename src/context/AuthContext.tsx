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
              const raw = response.data?.data || response.data;
              const freshUser: User = {
                id: String(raw.id),
                email: raw.email || '',
                name: raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || raw.username || 'User',
                role: (raw.role ? raw.role.toLowerCase() : 'receptionist') as User['role'],
              };
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

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Call actual backend authentication with usernameOrEmail and email for maximum compatibility
      const response = await api.post('/auth/login', {
        usernameOrEmail: emailOrUsername,
        email: emailOrUsername,
        password,
      });
      const payload = response.data?.data || response.data;
      const token = payload.token;
      const rawUser = payload.user || payload;

      const formattedUser: User = {
        id: String(rawUser.id),
        email: rawUser.email || (emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@gloryflorence.com`),
        name: rawUser.name || `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim() || rawUser.username || emailOrUsername,
        role: (rawUser.role ? rawUser.role.toLowerCase() : 'receptionist') as User['role'],
      };

      localStorage.setItem('gf_auth_token', token);
      localStorage.setItem('gf_auth_user', JSON.stringify(formattedUser));

      setState({
        user: formattedUser,
        isAuthenticated: true,
        loading: false,
      });

      showToast(`Welcome back, ${formattedUser.name}!`, 'success');
      return true;
    } catch (error: any) {
      // Offline fallback: check if it's a network error (server is not reachable)
      const isNetworkError = !error.response;
      if (isNetworkError) {
        console.warn("Backend not detected. Falling back to client-side mock authentication.");

        // Supports both backend seeded accounts (API_DOCUMENTATION.md Section 3.3) and email presets
        const mockAccounts: Record<string, { role: User['role']; name: string; password: string }> = {
          // Backend seeded accounts
          'admin': { role: 'superadmin', name: 'System Administrator', password: 'Admin123!' },
          'clinicadmin': { role: 'admin', name: 'Dr. Clinic Admin', password: 'Admin123!' },
          'therapist': { role: 'physiotherapist', name: 'Dr. John Therapist', password: 'Therapist123!' },
          'doctor': { role: 'doctor', name: 'Dr. Glory Doctor', password: 'Doctor123!' },
          'receptionist': { role: 'receptionist', name: 'Front Desk Receptionist', password: 'Receptionist123!' },
          'accountant': { role: 'accountant', name: 'Chief Accountant', password: 'Accountant123!' },
          'patientuser': { role: 'patient', name: 'Registered Patient', password: 'Patient123!' },

          // Email presets
          'admin@gloryflorence.com': { role: 'admin', name: 'Dr. Glory Admin', password: 'admin123' },
          'superadmin@gloryflorence.com': { role: 'superadmin', name: 'Dr. Glory Super Admin', password: 'admin123' },
          'therapist@gloryflorence.com': { role: 'physiotherapist', name: 'Dr. Glory Physiotherapist', password: 'admin123' },
          'physio@gloryflorence.com': { role: 'physiotherapist', name: 'Dr. Glory Physiotherapist', password: 'admin123' },
          'doctor@gloryflorence.com': { role: 'doctor', name: 'Dr. Glory Doctor', password: 'admin123' },
          'receptionist@gloryflorence.com': { role: 'receptionist', name: 'Front Desk Receptionist', password: 'admin123' },
          'accountant@gloryflorence.com': { role: 'accountant', name: 'Chief Accountant', password: 'admin123' },
          'patient@gloryflorence.com': { role: 'patient', name: 'Emily Watson', password: 'admin123' },
        };

        const key = emailOrUsername.toLowerCase().trim();
        const account = mockAccounts[key];

        if (account && (password === account.password || password === 'admin123' || password === 'Admin123!')) {
          const mockUser: User = {
            id: `usr_${account.role}`,
            email: key.includes('@') ? key : `${key}@gloryflorence.com`,
            name: account.name,
            role: account.role,
          };

          localStorage.setItem('gf_auth_token', `mock_jwt_token_for_gf_${account.role}`);
          localStorage.setItem('gf_auth_user', JSON.stringify(mockUser));

          setState({
            user: mockUser,
            isAuthenticated: true,
            loading: false,
          });

          showToast(`[Offline Mode] Signed in as ${mockUser.name} (${account.role})`, 'success');
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
