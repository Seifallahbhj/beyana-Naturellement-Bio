
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const Index = () => {
  // Nous utilisons des animations simples pour améliorer l'expérience utilisateur
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Récupérer les produits vedettes depuis l'API
  const { getFeaturedProducts } = useProducts();
  const featuredProducts = getFeaturedProducts;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-beyana-cream py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 order-2 md:order-1">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-beyana-brown mb-6"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5 }}
              >
                Naturellement Bio, <br />Naturellement Vous
              </motion.h1>
              <motion.p 
                className="text-lg mb-8 text-gray-700 max-w-md"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Découvrez notre sélection de collations et aliments biologiques, pour une vie saine et responsable.
              </motion.p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link to="/products">
                  <Button className="bg-beyana-green hover:bg-beyana-darkgreen text-white rounded-full px-8 py-6">
                    Découvrir nos produits
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="rounded-2xl overflow-hidden shadow-xl"
              >
                <img 
                  src="https://food.buzigo.com/annonceimg/56443117d03f71c86a20e88b44cedb6f.jpg" 
                  alt="Produits Beyana" 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12">Nos catégories</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Snacks",
                image: "https://www.europesnacks-france.com/wp-content/uploads/2022/06/assortiment-snacks.jpg",
                link: "/products?category=snacks"
              },
              {
                title: "Super-aliments",
                image: "https://cache.cosmopolitan.fr/data/photo/w1000_ci/5c/super-aliments.jpg",
                link: "/products?category=superfoods"
              },
              {
                title: "Petit-déjeuner",
                image: "https://www.ca-se-saurait.fr/wp-content/uploads/2012/10/food-2569257_1280-1000x666.jpg",
                link: "/products?category=breakfast"
              },
              {
                title: "Boissons",
                image: "https://www.1001cocktails.com/wp-content/uploads/1001cocktails/2023/05/shutterstock_1699610089.jpg",
                link: "/products?category=drinks"
              }
            ].map((category, index) => (
              <motion.div 
                key={category.title}
                className="bg-beyana-cream rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={category.link}>
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-beyana-green text-sm font-medium">Découvrir →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-beyana-cream/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-4">Nos produits vedettes</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto text-gray-600">
            Découvrez notre sélection de produits bio les plus appréciés par notre communauté
          </p>
          
          {featuredProducts.isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-beyana-green" />
              <span className="ml-2 text-lg">Chargement des produits vedettes...</span>
            </div>
          ) : featuredProducts.isError ? (
            <div className="text-center text-red-500 p-4 rounded-md bg-red-50 max-w-md mx-auto">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
              <p>Une erreur est survenue lors du chargement des produits vedettes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.data?.map((product, index) => (
                <motion.div 
                  key={product._id}
                  className="bg-white rounded-lg overflow-hidden shadow-md product-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Link to={`/products/${product.slug}`}>
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-beyana-green">{product.price.toFixed(2)} €</span>
                        <Button variant="outline" className="border-beyana-green text-beyana-green hover:bg-beyana-green hover:text-white transition-colors">
                          Ajouter
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="outline" className="rounded-full border-beyana-green text-beyana-green hover:bg-beyana-green hover:text-white px-8">
                Voir tous les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-16">Pourquoi choisir Beyana ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "100% Bio",
                description: "Tous nos produits sont certifiés biologiques, sans pesticides ni additifs chimiques.",
                icon: "🌱"
              },
              {
                title: "Livraison rapide",
                description: "Livraison en 48h pour toutes les commandes passées avant 14h.",
                icon: "🚚"
              },
              {
                title: "Qualité garantie",
                description: "Nous sélectionnons rigoureusement nos producteurs pour vous offrir le meilleur.",
                icon: "✓"
              }
            ].map((benefit, index) => (
              <motion.div 
                key={benefit.title}
                className="text-center px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-beyana-green text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-playfair font-bold mb-4">Restez informés</h2>
            <p className="mb-8">Inscrivez-vous à notre newsletter pour recevoir nos dernières offres et recettes</p>
            
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="px-4 py-3 w-full md:w-2/3 rounded-md md:rounded-r-none text-gray-800 focus:outline-none"
              />
              <Button className="w-full md:w-auto bg-beyana-brown hover:bg-opacity-80 text-white md:rounded-l-none">
                S'inscrire
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
