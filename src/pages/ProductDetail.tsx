
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useProductBySlug, useSimilarProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/services/api/productService';

// Interface pour les avis (reviews)
interface Review {
  author: string;
  rating: number;
  text: string;
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Récupérer les détails du produit depuis l'API
  const { data: product, isLoading, isError, error } = useProductBySlug(slug);
  
  // Ajouter des logs de débogage
  useEffect(() => {
    console.log('Slug actuel:', slug);
    console.log('Produit récupéré:', product);
    console.log('Erreur:', error);
  }, [slug, product, error]);
  
  // Récupérer les produits similaires
  const { data: similarProducts, isLoading: isSimilarLoading } = useSimilarProducts(product?._id);
  
  // Exemples d'avis (dans un cas réel, ils seraient récupérés depuis l'API)
  const mockReviews: Review[] = [
    { author: "Marie L.", rating: 5, text: "Délicieux et très rassasiant, je recommande !" },
    { author: "Thomas R.", rating: 4, text: "Très bon produit, je regrette juste qu'il n'y ait pas plus de fruits secs." }
  ];
  
  // Afficher un état de chargement
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <Skeleton className="h-96 w-full mb-4" />
              <div className="flex gap-2">
                {[1, 2, 3].map((_, index) => (
                  <Skeleton key={index} className="w-24 h-24" />
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-12 w-1/2 mb-4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Afficher une erreur
  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erreur!</strong>
            <span className="block sm:inline"> Impossible de charger les détails du produit.</span>
            <p className="mt-2">Détails de l'erreur: {(error as any)?.message || 'Erreur inconnue'}</p>
            <div className="mt-4">
              <Link to="/products" className="text-beyana-green hover:underline">
                Retour aux produits
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <p>Le produit que vous recherchez n'existe pas ou a été retiré.</p>
          <Button className="mt-4" asChild>
            <Link to="/products">Retour aux produits</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Gérer l'ajout au panier
  const handleAddToCart = () => {
    // Ici, vous implémenteriez la logique d'ajout au panier
    console.log(`Ajout au panier: ${quantity} x ${product.name}`);
    // TODO: Implémenter la fonctionnalité d'ajout au panier
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <motion.div 
              className="mb-4 rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={product.images && product.images.length > 0 ? product.images[selectedImage] : '/placeholder-product.jpg'} 
                alt={product.name} 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
            </motion.div>
            <div className="flex gap-2">
              {product.images && product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-green-600' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="flex items-center space-x-2 mb-4">
              {product.isOrganic && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Bio
                </span>
              )}
              {product.isVegan && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Végan
                </span>
              )}
              {product.isGlutenFree && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Sans gluten
                </span>
              )}
              {product.countryOfOrigin && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Origine: {product.countryOfOrigin}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-playfair font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 mr-1">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </span>
              <span className="text-sm text-gray-600">
                ({product.rating || '0'} - {product.numReviews || 0} avis)
              </span>
            </div>
            
            <div className="text-2xl font-bold mb-4">
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span>{product.discountPrice.toFixed(2)} €</span>
                  <span className="text-sm text-gray-500 line-through">{product.price.toFixed(2)} €</span>
                </div>
              ) : (
                <span>{product.price.toFixed(2)} €</span>
              )}
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="flex items-center mb-6">
              <span className="mr-2">Quantité:</span>
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={decrementQuantity}
                  className="px-3 py-1 border-r"
                  disabled={quantity <= 1 || product.stock <= 0}
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  className="px-3 py-1 border-l"
                  disabled={quantity >= product.stock || product.stock <= 0}
                >
                  +
                </button>
              </div>
              <span className={`ml-4 text-sm ${product.stock <= 5 ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}
              </span>
            </div>
            
            <Button 
              className="w-full mb-6" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button 
                className="bg-beyana-green hover:bg-beyana-darkgreen text-white"
                size="lg"
              >
                Ajouter au panier
              </Button>
              <Button 
                variant="outline" 
                className="border-beyana-green text-beyana-green hover:bg-beyana-green hover:text-white"
                size="lg"
              >
                Acheter maintenant
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="w-5 h-5 flex items-center justify-center bg-beyana-green text-white rounded-full text-xs">✓</span>
                Livraison offerte dès 49€ d'achat
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="w-5 h-5 flex items-center justify-center bg-beyana-green text-white rounded-full text-xs">✓</span>
                Satisfaction garantie ou remboursé
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 flex items-center justify-center bg-beyana-green text-white rounded-full text-xs">✓</span>
                Paiement sécurisé
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full border-b border-gray-200 mb-6">
              <TabsTrigger value="description" className="pb-2">Description</TabsTrigger>
              <TabsTrigger value="ingredients" className="pb-2">Ingrédients</TabsTrigger>
              <TabsTrigger value="nutrition" className="pb-2">Valeurs nutritionnelles</TabsTrigger>
              <TabsTrigger value="reviews" className="pb-2">Avis ({product.numReviews || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="text-gray-700">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="mb-4">{product.description}</p>
            </TabsContent>
            
            <TabsContent value="ingredients" className="p-4">
              <p className="text-gray-700 leading-relaxed">{product.ingredients}</p>
            </TabsContent>
            
            <TabsContent value="nutrition" className="text-gray-700">
              <h3 className="font-medium mb-2">Valeurs nutritionnelles</h3>
              <p className="text-sm mb-2">Portion: {product.nutritionalInfo?.servingSize || 'Non spécifié'}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Calories:</span> {product.nutritionalInfo?.calories || 0} kcal
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Protéines:</span> {product.nutritionalInfo?.protein || 0} g
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Glucides:</span> {product.nutritionalInfo?.carbs || 0} g
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Sucres:</span> {product.nutritionalInfo?.sugar || 0} g
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Matières grasses:</span> {product.nutritionalInfo?.fat || 0} g
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Graisses saturées:</span> {product.nutritionalInfo?.saturatedFat || 0} g
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Fibres:</span> {product.nutritionalInfo?.fiber || 0} g
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Sel:</span> {product.nutritionalInfo?.salt || 0} g
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="text-gray-700">
              <h3 className="font-medium mb-4">Avis clients ({mockReviews.length})</h3>
              
              {mockReviews.map((review, index) => (
                <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{review.author}</span>
                    <span className="text-yellow-500">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.text}</p>
                </div>
              ))}
              
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Écrire un avis
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
