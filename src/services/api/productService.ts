import api, { ApiResponse } from './client';

// Types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
    saturatedFat: number;
    fiber: number;
    salt: number;
    servingSize: string;
  };
  ingredients: string[];
  allergens: string[];
  countryOfOrigin: string;
  isOrganic: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  featured: boolean;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

// Service API pour les produits
const productService = {
  // Récupérer tous les produits avec filtres optionnels
  getProducts: async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
    // Construire les paramètres de requête à partir des filtres
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get<Product[]>(`/products?${params.toString()}`);
  },
  
  // Récupérer un produit par son ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return api.get<Product>(`/products/${id}`);
  },
  
  // Récupérer un produit par son slug
  getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    return api.get<Product>(`/products/slug/${slug}`);
  },
  
  // Récupérer les produits mis en avant
  getFeaturedProducts: async (): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>('/products/featured');
  },
  
  // Récupérer les produits similaires à un produit donné
  getSimilarProducts: async (productId: string): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>(`/products/${productId}/similar`);
  },
  
  // Créer un nouveau produit (admin)
  createProduct: async (productData: Omit<Product, '_id'>): Promise<ApiResponse<Product>> => {
    return api.post<Product>('/products', productData);
  },
  
  // Mettre à jour un produit existant (admin)
  updateProduct: async (id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    return api.put<Product>(`/products/${id}`, productData);
  },
  
  // Supprimer un produit (admin)
  deleteProduct: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<{ success: boolean }>(`/products/${id}`);
  },
  
  // Mettre à jour le stock d'un produit (admin)
  updateProductStock: async (id: string, stock: number): Promise<ApiResponse<Product>> => {
    return api.put<Product>(`/products/${id}/stock`, { stock });
  }
};

export default productService;
