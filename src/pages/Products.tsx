
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Product, ProductFilters } from '@/services/api/productService';

// Constantes pour les filtres
const MAX_PRICE = 50; // Prix maximum par défaut

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  // États pour les filtres
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOrganic, setIsOrganic] = useState<boolean | undefined>(undefined);
  const [isVegan, setIsVegan] = useState<boolean | undefined>(undefined);
  const [isGlutenFree, setIsGlutenFree] = useState<boolean | undefined>(undefined);
  
  // Construire l'objet de filtres pour l'API
  const filters: ProductFilters = {
    search: searchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    isOrganic,
    isVegan,
    isGlutenFree,
    page: currentPage,
    limit: 12 // Nombre de produits par page
  };
  
  // Utiliser les hooks pour récupérer les données
  const { getProducts } = useProducts(filters);
  const { getCategories } = useCategories();
  
  // Extraire les données
  const products = getProducts.data || [];
  const categories = getCategories.data || [];
  const isLoading = getProducts.isLoading || getCategories.isLoading;
  const isError = getProducts.isError || getCategories.isError;
  
  // Créer un ensemble de tags à partir des ingrédients et allergènes
  const allTags = [...new Set(
    products.flatMap(p => [
      ...(p.ingredients || []),
      ...(p.allergens || [])
    ])
  )];
  
  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-4">Nos Produits</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection de produits biologiques soigneusement sélectionnés pour votre bien-être.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-sm h-fit">
            <div className="mb-6">
              <h3 className="font-medium mb-3">Rechercher</h3>
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Catégories</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Prix</h3>
              <div className="px-2">
                <Slider
                  defaultValue={priceRange}
                  max={MAX_PRICE}
                  step={1}
                  onValueChange={setPriceRange}
                  disabled={isLoading}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{priceRange[0]} €</span>
                  <span>{priceRange[1]} €</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Caractéristiques</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="organic" 
                    checked={isOrganic === true}
                    onCheckedChange={(checked) => setIsOrganic(checked ? true : undefined)}
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="organic" 
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Produit biologique
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="vegan" 
                    checked={isVegan === true}
                    onCheckedChange={(checked) => setIsVegan(checked ? true : undefined)}
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="vegan" 
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Végan
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="glutenFree" 
                    checked={isGlutenFree === true}
                    onCheckedChange={(checked) => setIsGlutenFree(checked ? true : undefined)}
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="glutenFree" 
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Sans gluten
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Tags</h3>
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center">
                    <Checkbox 
                      id={`tag-${tag}`} 
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor={`tag-${tag}`} 
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              // Affichage du squelette de chargement
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <div className="flex gap-1 mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              // Affichage d'erreur
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur!</strong>
                <span className="block sm:inline"> Impossible de charger les produits. Veuillez réessayer plus tard.</span>
              </div>
            ) : products.length === 0 ? (
              // Aucun produit trouvé
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">Aucun produit ne correspond à votre recherche.</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                    setPriceRange([0, MAX_PRICE]);
                    setIsOrganic(undefined);
                    setIsVegan(undefined);
                    setIsGlutenFree(undefined);
                    setCurrentPage(1);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              // Affichage des produits
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <motion.div 
                      key={product._id}
                      className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link to={`/product/${product.slug}`} className="flex-grow flex flex-col">
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg'} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                          {product.stock < 10 && product.stock > 0 && (
                            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                              Plus que {product.stock} en stock
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Rupture de stock
                            </span>
                          )}
                          {product.isOrganic && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              BIO
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="mb-2">
                            {product.ingredients && product.ingredients.map(ingredient => (
                              <span key={ingredient} className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-2 mb-2">
                                {ingredient}
                              </span>
                            ))}
                            {product.isVegan && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                                Végan
                              </span>
                            )}
                            {product.isGlutenFree && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                                Sans gluten
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          <div className="text-yellow-500 mb-2">
                            {'★'.repeat(Math.floor(product.rating || 0))}
                            {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                            <span className="text-gray-600 text-xs ml-1">({product.rating || '0'})</span>
                          </div>
                          <div className="mt-auto flex justify-between items-center">
                            {product.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{product.discountPrice.toFixed(2)}€</span>
                                <span className="text-sm text-gray-500 line-through">{product.price.toFixed(2)}€</span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold">{product.price.toFixed(2)}€</span>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={product.stock === 0}
                              onClick={(e) => {
                                e.preventDefault();
                                // Add to cart logic would go here
                              }}
                            >
                              {product.stock === 0 ? 'Indisponible' : 'Ajouter'}
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                {/* Pagination */}
                {products.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                      >
                        Précédent
                      </Button>
                      <span className="mx-4 flex items-center">Page {currentPage}</span>
                      <Button 
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={products.length < filters.limit || isLoading}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
