import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// Configuration par défaut
// En développement, on utilise le proxy configuré dans vite.config.ts
// En production, on utilise l'URL complète définie dans les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur de requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Récupération du token depuis le localStorage
    const token = localStorage.getItem('token');
    
    // Ajout du token à l'en-tête Authorization si disponible
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Gestion du token expiré (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentative de rafraîchissement du token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token } = response.data.data;
          
          // Mise à jour du token dans le localStorage
          localStorage.setItem('token', token);
          
          // Mise à jour du token dans la requête originale
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${token}` };
          }
          
          // Réessayer la requête originale avec le nouveau token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, déconnexion de l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirection vers la page de connexion
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonctions d'API génériques
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
  
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
  
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
  
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Gestionnaire d'erreurs API
const handleApiError = (error: AxiosError): void => {
  const errorResponse = error.response?.data as ApiResponse | undefined;
  const errorMessage = errorResponse?.message || 'Une erreur est survenue';
  
  // Ici, vous pouvez ajouter une logique de notification d'erreur
  console.error('API Error:', errorMessage);
};

export default api;
