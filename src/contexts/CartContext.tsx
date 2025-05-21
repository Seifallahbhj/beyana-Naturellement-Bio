import { createContext } from 'react';
import { CartContextType } from '../types/cart';

/**
 * Contexte du panier pour l'application
 */
export const CartContext = createContext<CartContextType | undefined>(undefined);
