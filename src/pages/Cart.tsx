
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Mock cart data for now - in a real app this would come from context or state management
const mockCartItems = [
  {
    id: 1,
    name: "Granola protéiné",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    quantity: 2
  },
  {
    id: 2,
    name: "Mix de noix bio",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    quantity: 1
  }
];

const Cart = () => {
  const [cartItems, setCartItems] = React.useState(mockCartItems);
  const { toast } = useToast();

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 49 ? 0 : 4.99;
  const total = subtotal + shipping;

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) } 
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Produit supprimé",
      description: "L'article a été retiré de votre panier.",
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Commande en cours de traitement",
      description: "Redirection vers la page de paiement...",
    });
    // In a real app, this would redirect to checkout
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-playfair font-bold mb-8">Votre panier</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Produit</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-4 align-middle">
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Link to={`/products/${item.id}`} className="font-medium hover:text-beyana-green transition-colors">
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right align-middle">{item.price.toFixed(2)}€</TableCell>
                        <TableCell className="align-middle">
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium align-middle">
                          {(item.price * item.quantity).toFixed(2)}€
                        </TableCell>
                        <TableCell className="align-middle">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between mt-6">
                <Link to="/products">
                  <Button variant="outline" className="text-beyana-green border-beyana-green hover:bg-beyana-cream hover:text-beyana-green">
                    Continuer les achats
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:w-1/3"
            >
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4">Récapitulatif de la commande</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>{shipping === 0 ? "Gratuit" : `${shipping.toFixed(2)}€`}</span>
                  </div>
                  
                  {shipping > 0 && (
                    <div className="text-sm text-beyana-green">
                      <p>Livraison gratuite à partir de 49€ d'achat</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-beyana-green hover:bg-beyana-darkgreen text-white"
                  onClick={handleCheckout}
                >
                  Passer à la caisse
                </Button>
                
                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 flex items-center justify-center bg-beyana-green text-white rounded-full text-xs">✓</span>
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-beyana-green text-white rounded-full text-xs">✓</span>
                    Satisfait ou remboursé sous 14 jours
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier.</p>
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

export default Cart;
