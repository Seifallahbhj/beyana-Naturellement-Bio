import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { CartContextType } from '../types/cart';

/**
 * Hook personnalisé pour utiliser le contexte du panier
 * @returns Le contexte du panier
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
