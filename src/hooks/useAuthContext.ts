import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UseMutationResult } from '@tanstack/react-query';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  ForgotPasswordData, 
  ResetPasswordData,
  AuthResponse 
} from '../services/api/authService';
import { ApiResponse } from '../services/api/client';

/**
 * Type pour le contexte d'authentification
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: UseMutationResult<ApiResponse<AuthResponse>, Error, LoginCredentials, unknown>;
  register: UseMutationResult<ApiResponse<AuthResponse>, Error, RegisterData, unknown>;
  logout: () => void;
  forgotPassword: UseMutationResult<ApiResponse<{ message: string }>, Error, ForgotPasswordData, unknown>;
  resetPassword: UseMutationResult<ApiResponse<{ message: string }>, Error, ResetPasswordData, unknown>;
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * @returns Le contexte d'authentification
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
