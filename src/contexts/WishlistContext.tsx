import { createContext } from 'react';
import { WishlistContextType } from '../types/wishlist';

/**
 * Contexte de la wishlist pour l'application
 */
export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
