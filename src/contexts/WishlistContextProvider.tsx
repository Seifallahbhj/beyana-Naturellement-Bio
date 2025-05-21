import React, { ReactNode, useEffect, useReducer } from 'react';
import { WishlistContext } from './WishlistContext';
import { WishlistItem, WishlistState } from '../types/wishlist';
import { Product } from '../services/api/productService';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useCart } from '@/hooks/useCart';

// Actions du reducer
type WishlistAction =
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// État initial de la wishlist
const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null
};

// Fonction pour sauvegarder la wishlist dans localStorage
const saveWishlistToLocalStorage = (items: WishlistItem[]) => {
  localStorage.setItem('wishlist', JSON.stringify(items));
  localStorage.setItem('wishlistUpdatedAt', new Date().toISOString());
};

// Fonction pour charger la wishlist depuis localStorage
const loadWishlistFromLocalStorage = (): WishlistItem[] => {
  const wishlistData = localStorage.getItem('wishlist');
  return wishlistData ? JSON.parse(wishlistData) : [];
};

// Reducer pour gérer les actions de la wishlist
const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
        isLoading: false
      };
    case 'ADD_ITEM': {
      // Vérifier si le produit existe déjà dans la wishlist
      const existingItem = state.items.find(
        item => item.productId === action.payload.productId
      );

      if (existingItem) {
        return state; // Le produit est déjà dans la wishlist
      }

      const newItems = [...state.items, action.payload];
      saveWishlistToLocalStorage(newItems);
      return {
        ...state,
        items: newItems
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload);
      saveWishlistToLocalStorage(newItems);
      return {
        ...state,
        items: newItems
      };
    }
    case 'CLEAR_WISHLIST':
      localStorage.removeItem('wishlist');
      localStorage.removeItem('wishlistUpdatedAt');
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
 * Provider du contexte de la wishlist
 */
export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthContext();
  const { addItem } = useCart();

  // Charger la wishlist depuis localStorage au chargement
  useEffect(() => {
    const wishlistItems = loadWishlistFromLocalStorage();
    dispatch({ type: 'SET_WISHLIST', payload: wishlistItems });
  }, []);

  // Synchroniser la wishlist avec le serveur lorsque l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && user) {
      // TODO: Implémenter la synchronisation avec le serveur
      // wishlistService.getWishlist().then(response => {
      //   if (response.success && response.data) {
      //     dispatch({ type: 'SET_WISHLIST', payload: response.data.items });
      //   }
      // });
    }
  }, [isAuthenticated, user]);

  // Ajouter un produit à la wishlist
  const addToWishlist = (product: Product) => {
    const newItem: WishlistItem = {
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      addedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_ITEM', payload: newItem });

    toast({
      title: 'Produit ajouté à vos favoris',
      description: `${product.name} a été ajouté à votre liste de souhaits.`,
    });
  };

  // Supprimer un produit de la wishlist
  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

    toast({
      title: 'Produit retiré',
      description: 'L\'article a été retiré de votre liste de souhaits.',
    });
  };

  // Vider la wishlist
  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });

    toast({
      title: 'Liste vidée',
      description: 'Tous les articles ont été retirés de votre liste de souhaits.',
    });
  };

  // Vérifier si un produit est déjà dans la wishlist
  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.productId === productId);
  };

  // Déplacer un article de la wishlist vers le panier
  const moveToCart = (productId: string) => {
    const item = state.items.find(item => item.productId === productId);
    
    if (item) {
      // Trouver le produit complet (nécessaire pour addItem du panier)
      // Dans un cas réel, vous feriez un appel API pour obtenir les détails du produit
      // Pour cet exemple, nous allons créer un objet Product minimal
      const product: Product = {
        _id: item.productId,
        name: item.name,
        price: item.price,
        images: [item.image],
        // Autres propriétés requises par Product mais non utilisées ici
        slug: '',
        description: '',
        category: '',
        nutritionalInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          sugar: 0,
          fat: 0,
          saturatedFat: 0,
          fiber: 0,
          salt: 0,
          servingSize: ''
        },
        ingredients: [],
        allergens: [],
        countryOfOrigin: '',
        isOrganic: false,
        isVegan: false,
        isGlutenFree: false,
        stock: 10,
        sold: 0,
        rating: 0,
        numReviews: 0,
        featured: false
      };
      
      // Ajouter au panier
      addItem(product, 1);
      
      // Supprimer de la wishlist
      removeItem(productId);
      
      toast({
        title: 'Produit déplacé',
        description: `${item.name} a été déplacé vers votre panier.`,
      });
    }
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    wishlist: state,
    addItem: addToWishlist,
    removeItem,
    clearWishlist,
    isInWishlist,
    moveToCart
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};
