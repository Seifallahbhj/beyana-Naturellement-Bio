import { createContext } from 'react';
import { AuthContextType } from '../hooks/useAuthContext';

/**
 * Contexte d'authentification pour l'application
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
