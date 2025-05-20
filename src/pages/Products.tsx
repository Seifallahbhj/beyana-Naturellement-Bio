
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

// Liste de produits fictive
const mockProducts = [
  {
    id: 1,
    name: "Granola protéiné",
    price: 9.99,
    category: "breakfast",
    tags: ["vegan", "sans gluten"],
    image: "https://content.joseedistasio.ca/app/uploads/2024/12/02222315/natalie-behn-qj_zfYm-sdI-unsplash-999x1496.jpg",
    rating: 4.7,
    stock: 15
  },
  {
    id: 2,
    name: "Mix de noix bio",
    price: 12.49,
    category: "snacks",
    tags: ["vegan", "sans sucre"],
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    stock: 23
  },
  {
    id: 3,
    name: "Barre énergétique",
    price: 3.99,
    category: "snacks",
    tags: ["vegan", "sans gluten"],
    image: "https://img.freepik.com/photos-premium/assortiment-fruits-secs-noix_107389-1615.jpg",
    rating: 4.3,
    stock: 42
  },
  {
    id: 4,
    name: "Poudre de spiruline",
    price: 15.99,
    category: "superfoods",
    tags: ["vegan", "sans gluten"],
    image: "https://www.julienvenesson.fr/wp-content/uploads/spiruline-poudre-1024x665-optimized.jpg",
    rating: 4.8,
    stock: 8
  },
  {
    id: 5,
    name: "Thé vert matcha",
    price: 14.95,
    category: "drinks",
    tags: ["vegan", "bio"],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaSVwf8FB7UcpZFBV3OsO9F5x_ZvOQ9oQyVw&s",
    rating: 4.6,
    stock: 17
  },
  {
    id: 6,
    name: "Muesli aux fruits rouges",
    price: 7.49,
    category: "breakfast",
    tags: ["vegan", "sans sucre ajouté"],
    image: "https://www.test-achats.be/sante/-/media/ta-hline/images/home/food%20and%20nutrition/granola/news/2023/granola/untitled%20design%20(19).png?rev=b154a9dc-7aeb-4b99-9a1c-281dbdcd5c53&hash=675F778E501660ED9F343842BEA96BCB",
    rating: 4.4,
    stock: 29
  }
];

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const allCategories = [...new Set(mockProducts.map(p => p.category))];
  const allTags = [...new Set(mockProducts.flatMap(p => p.tags))];

  useEffect(() => {
    let filtered = mockProducts;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => 
        selectedTags.every(tag => p.tags.includes(tag))
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, selectedTags, priceRange]);
  
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
                placeholder="Nom du produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Catégorie</h3>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'snacks' ? 'Snacks' : 
                       category === 'breakfast' ? 'Petit-déjeuner' : 
                       category === 'superfoods' ? 'Super-aliments' : 
                       category === 'drinks' ? 'Boissons' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Prix (€)</h3>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 20]}
                  max={20}
                  step={0.5}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-6"
                />
                <div className="flex items-center justify-between text-sm">
                  <span>{priceRange[0]}€</span>
                  <span>{priceRange[1]}€</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="font-medium mb-3">Filtres</h3>
              <div className="space-y-2">
                {allTags.map(tag => (
                  <div key={tag} className="flex items-center">
                    <Checkbox 
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`tag-${tag}`}
                      className="text-sm cursor-pointer"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">Aucun produit ne correspond à votre recherche.</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-beyana-green"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                    setPriceRange([0, 20]);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div 
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md product-card h-full flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link to={`/products/${product.id}`} className="flex-grow flex flex-col">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="mb-2">
                          {product.tags.map(tag => (
                            <span key={tag} className="inline-block bg-beyana-cream text-xs px-2 py-1 rounded mr-2 mb-2">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <div className="text-yellow-500 mb-2">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                          <span className="text-gray-600 text-xs ml-1">({product.rating})</span>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-lg font-bold text-beyana-green">{product.price.toFixed(2)}€</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-beyana-green text-beyana-green hover:bg-beyana-green hover:text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to cart logic would go here
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
