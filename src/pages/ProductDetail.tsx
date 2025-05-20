
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Nous utilisons une liste de produits fictive
const mockProducts = [
  {
    id: 1,
    name: "Granola protéiné",
    price: 9.99,
    category: "breakfast",
    tags: ["vegan", "sans gluten"],
    description: "Notre granola protéiné est un mélange parfait de flocons d'avoine, de noix et de fruits secs bio. Riche en protéines végétales et fibres, c'est le petit-déjeuner idéal pour commencer la journée avec énergie.",
    longDescription: "Ce granola artisanal est fabriqué à partir d'ingrédients 100% biologiques sélectionnés avec soin. Les flocons d'avoine complète apportent des fibres essentielles tandis que le mélange de noix (amandes, noisettes et noix de cajou) et de graines de courge et de tournesol fournit des protéines de qualité. Légèrement sucré au sirop d'érable, il est parfait pour accompagner un yaourt, un smoothie ou simplement avec une boisson végétale.",
    ingredients: "Flocons d'avoine* (40%), amandes*, noisettes*, noix de cajou*, graines de courge*, graines de tournesol*, sirop d'érable*, huile de coco*, cannelle*. *Ingrédients issus de l'agriculture biologique.",
    nutritionalValues: {
      calories: 420,
      protein: 15,
      carbs: 45,
      fat: 20
    },
    images: [
      "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565548058679-92505e232da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviews: [
      { author: "Marie L.", rating: 5, text: "Délicieux et très rassasiant, je recommande !" },
      { author: "Thomas R.", rating: 4, text: "Très bon produit, je regrette juste qu'il n'y ait pas plus de fruits secs." }
    ],
    stock: 15
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Dans un cas réel, vous feriez un appel API ici
  const product = mockProducts.find(p => p.id.toString() === id);
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <p>Le produit que vous recherchez n'existe pas ou a été retiré.</p>
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
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-beyana-green' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              {product.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-block bg-beyana-cream text-xs px-2 py-1 rounded mr-2 mb-2"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl font-playfair font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="text-yellow-500 mr-2">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="text-gray-600 text-sm">
                {product.rating} ({product.reviews.length} avis)
              </span>
            </div>
            
            <p className="text-xl font-bold text-beyana-green mb-4">{product.price.toFixed(2)}€</p>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Quantité</p>
              <div className="flex items-center">
                <button 
                  onClick={decrementQuantity}
                  className="bg-gray-200 px-3 py-1 rounded-l-md"
                  disabled={quantity === 1}
                >
                  -
                </button>
                <span className="bg-gray-100 px-6 py-1">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  className="bg-gray-200 px-3 py-1 rounded-r-md"
                  disabled={quantity === product.stock}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {product.stock} unités disponibles
              </p>
            </div>
            
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
              <TabsTrigger value="reviews" className="pb-2">Avis ({product.reviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-4">
              <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
            </TabsContent>
            
            <TabsContent value="ingredients" className="p-4">
              <p className="text-gray-700 leading-relaxed">{product.ingredients}</p>
            </TabsContent>
            
            <TabsContent value="nutrition" className="p-4">
              <div className="bg-gray-50 p-4 rounded-md max-w-md">
                <h3 className="font-medium mb-3">Valeurs nutritionnelles (pour 100g)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span className="font-medium">{product.nutritionalValues.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protéines</span>
                    <span className="font-medium">{product.nutritionalValues.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucides</span>
                    <span className="font-medium">{product.nutritionalValues.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lipides</span>
                    <span className="font-medium">{product.nutritionalValues.fat}g</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-4">
              <div className="space-y-6">
                {product.reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 mb-4 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="text-yellow-500">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <span className="ml-2 font-medium">{review.author}</span>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
