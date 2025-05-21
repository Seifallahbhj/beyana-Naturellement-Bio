import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthContext } from './AuthContext';
import { AuthContextType } from '../hooks/useAuthContext';

/**
 * Provider du contexte d'authentification
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
