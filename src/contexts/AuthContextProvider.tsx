import React, { ReactNode, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { AuthContextType } from '../hooks/useAuthContext';
import authService, { 
  LoginCredentials, 
  RegisterData, 
  ForgotPasswordData, 
  ResetPasswordData,
  User
} from '../services/api/authService';
import { useToast } from '../hooks/use-toast';

/**
 * Fournit le contexte d'authentification à l'application
 * Gère la connexion, l'inscription, la déconnexion et la réinitialisation de mot de passe
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  /**
   * Charge l'utilisateur depuis le localStorage au démarrage
   */
  React.useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Gère le processus de connexion utilisateur
   */
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
        queryClient.invalidateQueries();
        
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue, ${response.data.user.firstName} !`,
          variant: 'default',
        });
        
        navigate('/');
      }
    },
    onError: (error: Error) => {
      // Analyse de l'erreur pour fournir un message plus spécifique à l'utilisateur
      let errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      
      if (error.message) {
        if (error.message.includes('not found') || error.message.includes('introuvable')) {
          errorMessage = 'Adresse email non reconnue. Veuillez vérifier ou créer un compte.';
        } else if (error.message.includes('password') || error.message.includes('mot de passe')) {
          errorMessage = 'Mot de passe incorrect. Veuillez réessayer.';
        } else if (error.message.includes('network') || error.message.includes('réseau')) {
          errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
        }
      }
      
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  /**
   * Gère le processus d'inscription d'un nouvel utilisateur
   */
  const register = useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
        queryClient.invalidateQueries();
        
        toast({
          title: 'Inscription réussie',
          description: `Bienvenue sur Naturellement Bio, ${response.data.user.firstName} !`,
          variant: 'default',
        });
        
        navigate('/');
      }
    },
    onError: (error: Error) => {
      // Analyse de l'erreur pour fournir un message plus spécifique
      let errorMessage = 'Impossible de créer votre compte. Veuillez réessayer.';
      
      if (error.message) {
        if (error.message.includes('email') && (error.message.includes('exists') || error.message.includes('existe'))) {
          errorMessage = 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.';
        } else if (error.message.includes('password') || error.message.includes('mot de passe')) {
          errorMessage = 'Problème avec le mot de passe. Assurez-vous qu\'il respecte les critères de sécurité.';
        } else if (error.message.includes('network') || error.message.includes('réseau')) {
          errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
        }
      }
      
      toast({
        title: 'Erreur d\'inscription',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  const forgotPassword = useMutation({
    mutationFn: (data: ForgotPasswordData) => authService.forgotPassword(data),
    onSuccess: (response) => {
      toast({
        title: 'Email envoyé',
        description: response.message || 'Un email de réinitialisation a été envoyé à votre adresse.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'email de réinitialisation.',
        variant: 'destructive',
      });
    },
  });

  /**
   * Finalise la réinitialisation du mot de passe avec le nouveau mot de passe
   */
  const resetPassword = useMutation({
    mutationFn: (data: ResetPasswordData) => authService.resetPassword(data),
    onSuccess: (response) => {
      toast({
        title: 'Mot de passe réinitialisé',
        description: response.message || 'Votre mot de passe a été réinitialisé avec succès.',
        variant: 'default',
      });
      
      navigate('/login');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de réinitialiser votre mot de passe.',
        variant: 'destructive',
      });
    },
  });

  /**
   * Déconnecte l'utilisateur et nettoie les données de session
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    queryClient.invalidateQueries();
    
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès.',
      variant: 'default',
    });
    
    navigate('/');
  };

  const auth = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
