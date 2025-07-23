import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'student' | 'teacher';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  const user: User | null = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || '',
    email: session.user.email || '',
    avatar: session.user.image || undefined,
    role: (session.user.role as 'admin' | 'student' | 'teacher') || 'student'
  } : null;

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('اطلاعات ورود نامعتبر است');
        throw new Error(result.error);
      }
    } catch (err) {
      setError('خطا در ورود به سیستم');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut({ redirect: false });
    } catch (err) {
      setError('خطا در خروج از سیستم');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ثبت نام');
      }

      // Sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
    } catch (err) {
      setError('خطا در ثبت نام');
      throw err;
    }
  };

  const value = {
    user,
    loading: status === 'loading',
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 