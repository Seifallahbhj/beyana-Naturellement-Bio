import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Wishlist = () => {
  const { wishlist, removeItem, moveToCart, clearWishlist } = useWishlist();
  const { items } = wishlist;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold">Votre liste de souhaits</h1>
          {items.length > 0 && (
            <Button 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-50"
              onClick={clearWishlist}
            >
              Vider la liste
            </Button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white text-red-500 hover:bg-red-50 hover:text-red-600 shadow-md"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="flex-grow p-4">
                    <Link to={`/products/${item.productId}`} className="block">
                      <h3 className="font-medium text-lg mb-2 hover:text-beyana-green transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-semibold text-beyana-green">
                      {item.price.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Ajouté le {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full bg-beyana-green hover:bg-beyana-darkgreen text-white flex items-center gap-2"
                      onClick={() => moveToCart(item.productId)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Ajouter au panier
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-beyana-cream mb-4">
              <Heart className="h-8 w-8 text-beyana-green" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Votre liste de souhaits est vide</h2>
            <p className="text-gray-600 mb-8">Explorez nos produits et ajoutez vos favoris à votre liste de souhaits.</p>
            <Link to="/products">
              <Button className="bg-beyana-green hover:bg-beyana-darkgreen text-white">
                Découvrir nos produits
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
