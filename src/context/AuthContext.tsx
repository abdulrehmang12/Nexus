import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { AUTH_TOKEN_KEY, setAuthToken } from '../lib/api';
import { AuthContextType, RegisterPayload, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setAuthToken(storedToken);
        setToken(storedToken);
        const { data } = await api.get<User>('/auth/profile');
        setUser(data);
      } catch (error) {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Successfully logged in');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', payload);
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Account created successfully');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email: string): Promise<string> => {
    try {
      const { data } = await api.post<{ resetToken: string }>('/auth/forgot-password', { email });
      toast.success('Password reset token generated');
      return data.resetToken;
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Unable to generate reset token';
      toast.error(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
      toast.success('Password reset successfully');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Unable to reset password';
      toast.error(message);
      throw new Error(message);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      const { data } = await api.put<User>('/auth/profile', updates);
      setUser(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Unable to update profile';
      toast.error(message);
      throw new Error(message);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Unable to update password';
      toast.error(message);
      throw new Error(message);
    }
  };

  const requestTwoFactorOtp = async (): Promise<string> => {
    try {
      const { data } = await api.post<{ otpCode: string }>('/auth/2fa/request');
      toast.success('Mock OTP generated');
      return data.otpCode;
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Unable to generate OTP';
      toast.error(message);
      throw new Error(message);
    }
  };

  const verifyTwoFactorOtp = async (otpCode: string): Promise<void> => {
    try {
      const { data } = await api.post<{ user: User }>('/auth/2fa/verify', { otpCode });
      setUser(data.user);
      toast.success('Two-factor authentication enabled');
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Unable to verify OTP';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    requestTwoFactorOtp,
    verifyTwoFactorOtp,
    isAuthenticated: !!user && !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
