import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: () => void;
  logout: () => void;
}

const DEMO_USER: User = {
  id: 'usr_demo_123',
  name: 'Alex González',
  email: 'alex.gonzalez@centavo.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  role: 'Premium Member',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('centavo_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading stored user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    // Simulación de autenticación
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0] || 'Usuario',
      email,
      role: 'Estándar',
    };

    setUser(loggedUser);
    localStorage.setItem('centavo_user', JSON.stringify(loggedUser));
    setIsLoading(false);
    return true;
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem('centavo_user', JSON.stringify(DEMO_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('centavo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
