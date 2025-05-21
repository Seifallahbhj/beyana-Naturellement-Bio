import api, { ApiResponse } from './client';

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirm: string;
  token: string;
}

// Service API pour l'authentification
const authService = {
  // Connexion utilisateur
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    // Utiliser le bon chemin d'API avec le préfixe standardisé
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Stocker les tokens et les informations utilisateur dans le localStorage avec expiration
      const expiresIn = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
      const expiresAt = new Date().getTime() + expiresIn;
      
      // Stocker les tokens avec leur date d'expiration
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tokenExpiry', expiresAt.toString());
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('refreshTokenExpiry', (new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toString()); // 30 jours
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('lastActivity', new Date().getTime().toString());
    }
    
    return response;
  },
  
  // Inscription utilisateur
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    // Utiliser le bon chemin d'API avec le préfixe standardisé
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data) {
      // Stocker les tokens et les informations utilisateur dans le localStorage avec expiration
      const expiresIn = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
      const expiresAt = new Date().getTime() + expiresIn;
      
      // Stocker les tokens avec leur date d'expiration
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tokenExpiry', expiresAt.toString());
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('refreshTokenExpiry', (new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toString()); // 30 jours
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('lastActivity', new Date().getTime().toString());
    }
    
    return response;
  },
  
  // Déconnexion utilisateur
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    
    // Redirection vers la page d'accueil
    window.location.href = '/';
  },
  
  // Vérifier si l'utilisateur est connecté et si le token n'est pas expiré
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !tokenExpiry) {
      return false;
    }
    
    // Vérifier si le token a expiré
    const now = new Date().getTime();
    const expiryTime = parseInt(tokenExpiry, 10);
    
    if (now > expiryTime) {
      // Le token a expiré, essayer de le rafraîchir automatiquement
      try {
        authService.refreshToken();
        return true;
      } catch {
        // Si le rafraîchissement échoue, supprimer les tokens expirés
        authService.clearExpiredTokens();
        return false;
      }
    }
    
    return true;
  },
  
  // Supprimer les tokens expirés
  clearExpiredTokens: (): void => {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const refreshTokenExpiry = localStorage.getItem('refreshTokenExpiry');
    const now = new Date().getTime();
    
    if (tokenExpiry && parseInt(tokenExpiry, 10) < now) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
    
    if (refreshTokenExpiry && parseInt(refreshTokenExpiry, 10) < now) {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshTokenExpiry');
      localStorage.removeItem('user');
    }
  },
  
  // Récupérer l'utilisateur actuel
  getCurrentUser: (): User | null => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  },
  
  // Vérifier si l'utilisateur est un administrateur
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user ? user.role === 'ADMIN' : false;
  },
  
  // Demande de réinitialisation de mot de passe
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse<{ message: string }>> => {
    return api.post<{ message: string }>('/auth/forgot-password', data);
  },
  
  // Réinitialisation du mot de passe
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> => {
    return api.post<{ message: string }>('/auth/reset-password', data);
  },
  
  // Rafraîchir le token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }
    
    const response = await api.post<{ token: string }>('/auth/refresh-token', { refreshToken });
    
    if (response.success && response.data) {
      // Mettre à jour le token avec une nouvelle date d'expiration
      const expiresIn = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
      const expiresAt = new Date().getTime() + expiresIn;
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tokenExpiry', expiresAt.toString());
      localStorage.setItem('lastActivity', new Date().getTime().toString());
    }
    
    return response;
  }
};

export default authService;
