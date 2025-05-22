import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

/**
 * Configuration de l'API
 * - En développement: utilise le proxy configuré dans vite.config.ts
 * - En production: utilise l'URL complète des variables d'environnement
 */
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Ajoute automatiquement le token JWT aux requêtes si disponible
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Gère les réponses API et implémente le rafraîchissement automatique des tokens
 * en cas d'expiration (401 Unauthorized)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token } = response.data.data;
          localStorage.setItem('token', token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${token}` };
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Déconnexion en cas d'échec du rafraîchissement
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Fonctions d'API génériques avec gestion d'erreurs intégrée
 */
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
  
  post: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
  
  put: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
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

/**
 * Journalise les erreurs API avec des informations détaillées pour faciliter le débogage
 */
const handleApiError = (error: AxiosError): void => {
  const errorResponse = error.response?.data as ApiResponse | undefined;
  const errorMessage = errorResponse?.message || 'Une erreur est survenue';
  
  console.error('API Error:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    message: errorMessage,
    data: errorResponse,
    headers: error.config?.headers,
    requestData: error.config?.data,
    responseData: error.response?.data
  });
  
  console.warn(`🔴 API ERROR (${error.response?.status || 'unknown'}): ${errorMessage}`);
};

export default api;
