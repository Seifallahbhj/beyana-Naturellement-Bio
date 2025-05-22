import api, { ApiResponse } from './client';

// Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  level: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string | Category;
  stock: number;
  rating?: number;
  numReviews?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryPath {
  _id: string;
  name: string;
  slug: string;
}

// Service API pour les catégories
const categoryService = {
  // Récupérer toutes les catégories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return api.get<Category[]>('/categories');
  },
  
  // Récupérer une catégorie par son ID
  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    return api.get<Category>(`/categories/${id}`);
  },
  
  // Récupérer une catégorie par son slug
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    return api.get<Category>(`/categories/slug/${slug}`);
  },
  
  // Récupérer les sous-catégories d'une catégorie
  getSubcategories: async (categoryId: string): Promise<ApiResponse<Category[]>> => {
    return api.get<Category[]>(`/categories/${categoryId}/subcategories`);
  },
  
  // Récupérer le chemin complet d'une catégorie (pour les fils d'Ariane)
  getCategoryPath: async (categoryId: string): Promise<ApiResponse<CategoryPath[]>> => {
    return api.get<CategoryPath[]>(`/categories/${categoryId}/path`);
  },
  
  // Récupérer les produits d'une catégorie
  getCategoryProducts: async (categoryId: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    return api.get<PaginatedResponse<Product>>(`/categories/${categoryId}/products?page=${page}&limit=${limit}`);
  },
  
  // Créer une nouvelle catégorie (admin)
  createCategory: async (categoryData: Omit<Category, '_id'>): Promise<ApiResponse<Category>> => {
    return api.post<Category>('/categories', categoryData);
  },
  
  // Mettre à jour une catégorie existante (admin)
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    return api.put<Category>(`/categories/${id}`, categoryData);
  },
  
  // Supprimer une catégorie (admin)
  deleteCategory: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<{ success: boolean }>(`/categories/${id}`);
  }
};

export default categoryService;
