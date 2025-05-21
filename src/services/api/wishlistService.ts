import api, { ApiResponse } from './client';
import { Product } from './productService';

// Types pour la wishlist
export interface WishlistItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export interface Wishlist {
  _id?: string;
  userId?: string;
  items: WishlistItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Service API pour la wishlist
const wishlistService = {
  // Récupérer le contenu de la wishlist
  getWishlist: async (): Promise<ApiResponse<Wishlist>> => {
    return api.get<Wishlist>('/wishlist');
  },

  // Ajouter un produit à la wishlist
  addToWishlist: async (productId: string): Promise<ApiResponse<Wishlist>> => {
    return api.post<Wishlist>('/wishlist/add', { productId });
  },

  // Supprimer un produit de la wishlist
  removeFromWishlist: async (productId: string): Promise<ApiResponse<Wishlist>> => {
    return api.delete<Wishlist>(`/wishlist/item/${productId}`);
  },

  // Vider la wishlist
  clearWishlist: async (): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<{ success: boolean }>('/wishlist');
  },

  // Déplacer un article de la wishlist vers le panier
  moveToCart: async (productId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.post<{ success: boolean }>(`/wishlist/move-to-cart/${productId}`, {});
  }
};

export default wishlistService;
