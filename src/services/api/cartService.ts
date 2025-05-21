import api, { ApiResponse } from './client';
import { Product } from './productService';

// Types pour le panier
export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

// Service API pour le panier
const cartService = {
  // Récupérer le contenu du panier
  getCart: async (): Promise<ApiResponse<Cart>> => {
    return api.get<Cart>('/cart');
  },

  // Ajouter un produit au panier
  addToCart: async (productId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    return api.post<Cart>('/cart/add', { productId, quantity });
  },

  // Mettre à jour la quantité d'un produit dans le panier
  updateCartItem: async (itemId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    return api.put<Cart>(`/cart/item/${itemId}`, { quantity });
  },

  // Supprimer un produit du panier
  removeFromCart: async (itemId: string): Promise<ApiResponse<Cart>> => {
    return api.delete<Cart>(`/cart/item/${itemId}`);
  },

  // Vider le panier
  clearCart: async (): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<{ success: boolean }>('/cart');
  },

  // Synchroniser le panier local avec le serveur
  syncCart: async (items: CartItem[]): Promise<ApiResponse<Cart>> => {
    return api.post<Cart>('/cart/sync', { items });
  }
};

export default cartService;
