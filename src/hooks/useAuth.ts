import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService, { 
  LoginCredentials, 
  RegisterData, 
  ForgotPasswordData, 
  ResetPasswordData,
  User
} from '../services/api/authService';
import { useToast } from './use-toast';
import { useState, useEffect } from 'react';

// Hook personnalisé pour l'authentification
export const useAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au montage du composant
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Mutation pour la connexion
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
        
        // Invalider toutes les requêtes qui pourraient dépendre de l'état d'authentification
        queryClient.invalidateQueries();
        
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue, ${response.data.user.firstName} !`,
          variant: 'default',
        });
        
        // Redirection vers la page d'accueil ou la page précédente
        navigate('/');
      }
    },
    onError: (error: Error) => {
      // Analyse de l'erreur pour fournir un message plus spécifique
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

  // Mutation pour l'inscription
  const register = useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (response) => {
      if (response.data?.user) {
        setUser(response.data.user);
        
        // Invalider toutes les requêtes qui pourraient dépendre de l'état d'authentification
        queryClient.invalidateQueries();
        
        toast({
          title: 'Inscription réussie',
          description: `Bienvenue sur Naturellement Bio, ${response.data.user.firstName} !`,
          variant: 'default',
        });
        
        // Redirection vers la page d'accueil
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

  // Mutation pour la demande de réinitialisation de mot de passe
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

  // Mutation pour la réinitialisation de mot de passe
  const resetPassword = useMutation({
    mutationFn: (data: ResetPasswordData) => authService.resetPassword(data),
    onSuccess: (response) => {
      toast({
        title: 'Mot de passe réinitialisé',
        description: response.message || 'Votre mot de passe a été réinitialisé avec succès.',
        variant: 'default',
      });
      
      // Redirection vers la page de connexion
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

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    
    // Invalider toutes les requêtes qui pourraient dépendre de l'état d'authentification
    queryClient.invalidateQueries();
    
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès.',
      variant: 'default',
    });
    
    // Redirection vers la page d'accueil
    navigate('/');
  };

  return {
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
};
