import React, { ReactNode, useEffect, useReducer } from 'react';
import { CartContext } from './CartContext';
import { CartItem, CartState } from '../types/cart';
import { Product } from '../services/api/productService';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/hooks/useAuthContext';

// Actions du reducer
type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// État initial du panier
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null
};

// Fonction pour sauvegarder le panier dans localStorage
const saveCartToLocalStorage = (items: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(items));
  localStorage.setItem('cartUpdatedAt', new Date().toISOString());
};

// Fonction pour charger le panier depuis localStorage
const loadCartFromLocalStorage = (): CartItem[] => {
  const cartData = localStorage.getItem('cart');
  return cartData ? JSON.parse(cartData) : [];
};

// Reducer pour gérer les actions du panier
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        isLoading: false
      };
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Si le produit existe déjà, mettre à jour la quantité
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity
        };
      } else {
        // Sinon, ajouter le nouveau produit
        newItems = [...state.items, action.payload];
      }

      saveCartToLocalStorage(newItems);
      return {
        ...state,
        items: newItems
      };
    }
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      saveCartToLocalStorage(newItems);
      return {
        ...state,
        items: newItems
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      saveCartToLocalStorage(newItems);
      return {
        ...state,
        items: newItems
      };
    }
    case 'CLEAR_CART':
      localStorage.removeItem('cart');
      localStorage.removeItem('cartUpdatedAt');
      return {
        ...state,
        items: []
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};

/**
 * Provider du contexte du panier
 */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthContext();

  // Charger le panier depuis localStorage au chargement
  useEffect(() => {
    const cartItems = loadCartFromLocalStorage();
    dispatch({ type: 'SET_CART', payload: cartItems });
  }, []);

  // Synchroniser le panier avec le serveur lorsque l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && user) {
      // TODO: Implémenter la synchronisation avec le serveur
      // cartService.syncCart(state.items).then(response => {
      //   if (response.success && response.data) {
      //     dispatch({ type: 'SET_CART', payload: response.data.items });
      //   }
      // });
    }
  }, [isAuthenticated, user]);

  // Ajouter un produit au panier
  const addItem = (product: Product, quantity: number) => {
    const newItem: CartItem = {
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity
    };

    dispatch({ type: 'ADD_ITEM', payload: newItem });

    toast({
      title: 'Produit ajouté',
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  // Mettre à jour la quantité d'un produit
  const updateItem = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    dispatch({
      type: 'UPDATE_ITEM',
      payload: { id: itemId, quantity }
    });
  };

  // Supprimer un produit du panier
  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });

    toast({
      title: 'Produit supprimé',
      description: 'L\'article a été retiré de votre panier.',
    });
  };

  // Vider le panier
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });

    toast({
      title: 'Panier vidé',
      description: 'Tous les articles ont été retirés de votre panier.',
    });
  };

  // Calculer le total du panier
  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculer le nombre total d'articles dans le panier
  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Vérifier si un produit est déjà dans le panier
  const isInCart = (productId: string) => {
    return state.items.some(item => item.productId === productId);
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    cart: state,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
