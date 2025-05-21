import { useContext } from 'react';
import { WishlistContext } from '../contexts/WishlistContext';
import { WishlistContextType } from '../types/wishlist';

/**
 * Hook personnalisé pour utiliser le contexte de la wishlist
 * @returns Le contexte de la wishlist
 */
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
};
