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
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Stocker les tokens et les informations utilisateur dans le localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  // Inscription utilisateur
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data) {
      // Stocker les tokens et les informations utilisateur dans le localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  // Déconnexion utilisateur
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirection vers la page d'accueil
    window.location.href = '/';
  },
  
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
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
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<{ token: string }>('/auth/refresh-token', { refreshToken });
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }
};

export default authService;
