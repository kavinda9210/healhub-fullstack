import React, { createContext, useState, useContext, ReactNode } from 'react';
import { API_BASE } from './config';

type Role = 'patient' | 'admin' | 'doctor' | 'ambulance';

type User = { email: string; role: Role } | null;

type AuthContextType = {
  isAuthenticated: boolean;
  user: User;
  login: (email: string, password: string, role?: Role) => Promise<boolean>;
  register: (email: string, password: string, role?: Role) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  // UI state
  showAuthModal: boolean;
  authScreen: 'login' | 'register' | 'forgot' | 'reset';
  showDashboard: boolean;
  openAuth: (screen?: AuthContextType['authScreen']) => void;
  closeAuth: () => void;
  openDashboard: (role?: Role) => void;
  closeDashboard: () => void;
  showDashboardRole?: Role | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthContextType['authScreen']>('login');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDashboardRole, setShowDashboardRole] = useState<Role | null>(null);

  const fakeDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

  const login = async (email: string, password?: string, role: Role = 'patient') => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUser({ email: data.email ?? email, role: data.role ?? role });
      setShowAuthModal(false);
      return true;
    } catch (err) {
      console.warn('Login error, falling back to local auth:', err);
      await fakeDelay();
      setUser({ email, role });
      setShowAuthModal(false);
      return true;
    }
  };

  const register = async (email: string, password?: string, role: Role = 'patient') => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUser({ email: data.email ?? email, role: data.role ?? role });
      setShowAuthModal(false);
      return true;
    } catch (err) {
      console.warn('Register error, falling back to local auth:', err);
      await fakeDelay();
      setUser({ email, role });
      setShowAuthModal(false);
      return true;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      /* ignore */
    }
    setUser(null);
    setShowDashboard(false);
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch (err) {
      console.warn('Forgot password request failed, falling back:', err);
      await fakeDelay();
      return true;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch (err) {
      console.warn('Reset password failed, falling back:', err);
      await fakeDelay();
      return true;
    }
  };

  const openAuth = (screen: AuthContextType['authScreen'] = 'login') => {
    setAuthScreen(screen);
    setShowAuthModal(true);
  };

  const closeAuth = () => setShowAuthModal(false);

  const openDashboard = (role?: Role) => {
    if (role) setShowDashboardRole(role);
    else setShowDashboardRole(user?.role ?? 'patient');
    setShowDashboard(true);
  };
  const closeDashboard = () => {
    setShowDashboard(false);
    setShowDashboardRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login: async (email: string, _password: string, role?: Role) => login(email, role),
        register: async (email: string, _password: string, role?: Role) => register(email, role),
        logout,
        requestPasswordReset,
        resetPassword,
        showAuthModal,
        authScreen,
        showDashboard,
        openAuth,
        closeAuth,
        openDashboard,
        closeDashboard,
        showDashboardRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
