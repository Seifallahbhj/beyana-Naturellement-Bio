import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../services/api/authService';

// Type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: any; // Utiliser any pour éviter les problèmes de type avec useMutation
  register: any; // Utiliser any pour éviter les problèmes de type avec useMutation
  logout: () => void;
  forgotPassword: any; // Utiliser any pour éviter les problèmes de type avec useMutation
  resetPassword: any; // Utiliser any pour éviter les problèmes de type avec useMutation
}

// Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider du contexte d'authentification
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
