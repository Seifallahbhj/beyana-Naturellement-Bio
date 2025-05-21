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
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Product, ProductFilters } from '@/services/api/productService';
import { Badge } from '@/components/ui/badge';

// Constantes pour les filtres
const MAX_PRICE = 50; // Prix maximum par défaut

// Options de tri
const sortOptions = [
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'Nom (A-Z)' },
  { value: 'name_desc', label: 'Nom (Z-A)' },
  { value: 'rating_desc', label: 'Mieux notés' },
  { value: 'newest', label: 'Nouveautés' }
];

// Pays d'origine
const originCountries = [
  'France',
  'Italie',
  'Espagne',
  'Allemagne',
  'Belgique',
  'Suisse',
  'Autre'
];

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
  const [selectedOrigin, setSelectedOrigin] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false); // Pour mobile
  
  // Construire l'objet de filtres pour l'API
  const filters: ProductFilters = {
    search: searchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    isOrganic,
    isVegan,
    isGlutenFree,
    countryOfOrigin: selectedOrigin,
    sort: sortBy,
    page: currentPage,
    limit: 12 // Nombre de produits par page
  };
  
  // Utiliser les hooks pour récupérer les données
  const { getProducts } = useProducts(filters);
  const { getCategories } = useCategories();
  
  // Extraire les données
  const productData = getProducts.data || { data: [], total: 0, page: 1, limit: 12, totalPages: 1 };
  const products = productData.data;
  const totalProducts = productData.total;
  const totalPages = productData.totalPages;
  const categories = getCategories.data || [];
  const isLoading = getProducts.isLoading || getCategories.isLoading;
  const isError = getProducts.isError || getCategories.isError;
  
  // Logs de débogage en mode développement uniquement
  if (import.meta.env.DEV) {
    console.log('Filtres actuels:', filters);
    console.log('Produits chargés:', productData);
    console.log('Catégories chargées:', categories);
    console.log('État de chargement:', isLoading);
    console.log('Erreurs:', getProducts.error, getCategories.error);
    
    // Logs détaillés pour le débogage des requêtes API
    console.log('URL de l\'API:', import.meta.env.VITE_API_URL || '/api/v1');
    console.log('Status de la requête:', getProducts.status);
    console.log('Données brutes de la réponse:', getProducts.data);
    console.log('Nombre total de produits:', totalProducts);
  }
  
  // Gérer les nouvelles tentatives en cas d'échec
  useEffect(() => {
    if (getProducts.isError || getCategories.isError) {
      const timer = setTimeout(() => {
        console.log('Tentative de rechargement des données après erreur...');
        getProducts.refetch();
        getCategories.refetch();
      }, 5000); // Réessayer après 5 secondes
      
      return () => clearTimeout(timer);
    }
  }, [getProducts.isError, getCategories.isError, getProducts, getCategories]);
  
  // Créer un ensemble de tags à partir des ingrédients et allergènes
  const allTags = [...new Set(
    products.flatMap(p => [
      ...(p.ingredients || []),
      ...(p.allergens || [])
    ])
  )];
  
  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setPriceRange([0, MAX_PRICE]);
    setIsOrganic(undefined);
    setIsVegan(undefined);
    setIsGlutenFree(undefined);
    setSelectedOrigin(undefined);
    setSortBy('newest');
    setCurrentPage(1);
  };
  
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
          {/* Sidebar Filters */}
          <div className="lg:w-1/4 mb-6 lg:mb-0 lg:pr-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filtres</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                </Button>
              </div>
              
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
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
                  <h3 className="font-medium mb-3">Pays d'origine</h3>
                  <Select value={selectedOrigin || 'all'} onValueChange={(value) => setSelectedOrigin(value === 'all' ? undefined : value)} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      {originCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Trier par</h3>
                  <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    className="w-full mb-2" 
                    onClick={resetAllFilters}
                    disabled={isLoading}
                  >
                    Réinitialiser tous les filtres
                  </Button>
                  <div className="text-xs text-gray-500 text-center">
                    {products.length} produit{products.length !== 1 ? 's' : ''} trouvé{products.length !== 1 ? 's' : ''}
                  </div>
                </div>
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
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Aucun produit trouvé!</strong>
                <span className="block sm:inline"> Essayez de modifier vos filtres pour voir plus de résultats.</span>
              </div>
            ) : (
              // Affichage des produits
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <motion.div 
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col"
                    >
                      <Link to={`/products/${product.slug}`} className="block overflow-hidden h-48 relative">
                        <img 
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg'} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        {product.isOrganic && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            BIO
                          </div>
                        )}
                      </Link>
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <Link to={`/products/${product.slug}`} className="block">
                            <h2 className="text-lg font-semibold mb-1 hover:text-primary transition-colors">{product.name}</h2>
                          </Link>
                          <p className="text-sm text-gray-600 mb-2">
                            {typeof product.category === 'object' && product.category && 'name' in product.category 
                              ? product.category.name 
                              : typeof product.category === 'string' ? product.category : ''}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {product.isVegan && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Végan
                              </Badge>
                            )}
                            {product.isGlutenFree && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Sans Gluten
                              </Badge>
                            )}
                            {product.countryOfOrigin && (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                {product.countryOfOrigin}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">{product.price.toFixed(2)} €</span>
                          <Button size="sm">
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="mt-8">
                  {/* Affichage du nombre total de produits */}
                  <div className="text-center mb-4 text-gray-600">
                    Affichage de {products.length} produit{products.length > 1 ? 's' : ''} sur {totalProducts} au total
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        size="sm"
                      >
                        <span className="sr-only">Page précédente</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                      </Button>
                      
                      {/* Numéros de page */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logique pour afficher les pages autour de la page courante
                        let pageNum;
                        if (totalPages <= 5) {
                          // Moins de 5 pages au total, afficher toutes les pages
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // Proche du début, afficher les 5 premières pages
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // Proche de la fin, afficher les 5 dernières pages
                          pageNum = totalPages - 4 + i;
                        } else {
                          // Au milieu, afficher 2 pages avant et 2 pages après
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button 
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                            size="sm"
                            className="w-10 h-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || isLoading}
                        size="sm"
                      >
                        <span className="sr-only">Page suivante</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
