
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, ChefHat, Utensils } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Mock recipes data
const recipes = [
  {
    id: 1,
    title: 'Granola maison aux amandes et cranberries',
    category: 'petit-dejeuner',
    tags: ['vegan', 'sans gluten'],
    cookTime: '30 min',
    difficulty: 'Facile',
    image: 'https://www.bioandco.bio/wp-content/uploads/2023/08/recette-1.jpg',
    description: 'Un granola croustillant fait maison avec des amandes et des cranberries, parfait pour un petit-déjeuner sain et énergétique.',
  },
  {
    id: 2,
    title: 'Bol bouddha aux légumes rôtis',
    category: 'dejeuner',
    tags: ['vegan', 'riche en protéines'],
    cookTime: '45 min',
    difficulty: 'Moyen',
    image: 'https://cache.magazine-avantages.fr/data/photo/w1000_ci/5s/buddha-bowl-tendance-food-healthy.jpg',
    description: 'Un bol complet avec des légumes rôtis, du quinoa et une sauce tahini crémeuse pour un repas équilibré et nourrissant.',
  },
  {
    id: 3,
    title: 'Barres énergétiques aux dattes et noix',
    category: 'snacks',
    tags: ['sans sucre ajouté', 'sans cuisson'],
    cookTime: '15 min',
    difficulty: 'Facile',
    image: 'https://recettehealthy.com/wp-content/uploads/2023/01/barre-crue.jpg',
    description: 'Des barres énergétiques naturelles à base de dattes et de noix, parfaites pour une collation rapide et nutritive.',
  },
  {
    id: 4,
    title: 'Curry de légumes aux pois chiches',
    category: 'diner',
    tags: ['vegan', 'riche en protéines'],
    cookTime: '40 min',
    difficulty: 'Moyen',
    image: 'https://image.over-blog.com/iZDNYECXD5DCefnARDhcmUOzUG8=/filters:no_upscale()/image%2F0651923%2F20200413%2Fob_304dbe_ob-0784cb-curry-poireau-cookeo.jpg',
    description: 'Un curry réconfortant aux légumes et pois chiches, servi avec du riz basmati pour un dîner savoureux et nutritif.',
  },
  {
    id: 5,
    title: 'Smoothie bowl aux fruits rouges',
    category: 'petit-dejeuner',
    tags: ['vegan', 'sans gluten'],
    cookTime: '10 min',
    difficulty: 'Facile',
    image: 'https://img.fourchette-et-bikini.fr/660x495/2024-08/shutterstock_2059436936.jpg',
    description: 'Un smoothie bowl rafraîchissant aux fruits rouges, garni de graines et de fruits frais pour un petit-déjeuner vitaminé.',
  },
  {
    id: 6,
    title: 'Soupe de lentilles corail à la noix de coco',
    category: 'diner',
    tags: ['vegan', 'sans gluten'],
    cookTime: '35 min',
    difficulty: 'Facile',
    image: 'https://img.hellofresh.com/f_auto,fl_lossy,q_auto,w_1200/hellofresh_s3/image/HF_Y25_R213_W01_FR_RFR29593-1_Main_high-b4b72c8b.jpg',
    description: 'Une soupe crémeuse et réconfortante de lentilles corail au lait de coco et aux épices, parfaite pour les soirées fraîches.',
  }
];

const RecipesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || recipe.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-beyana-green mb-4">
            Nos Recettes Biologiques
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-gray-600">
            Découvrez des recettes délicieuses préparées avec nos produits biologiques. 
            Des repas sains, nutritifs et savoureux pour chaque moment de la journée.
          </p>
        </div>
        
        {/* Search and filter section */}
        <div className="mb-10">
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Rechercher une recette..." 
              className="pl-10 border-beyana-green/30 focus-visible:ring-beyana-green"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <Tabs defaultValue="all" className="max-w-4xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="all" className="flex flex-col items-center gap-2">
                <ChefHat className="h-5 w-5" />
                <span>Tout</span>
              </TabsTrigger>
              <TabsTrigger value="petit-dejeuner" className="flex flex-col items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Petit-déj</span>
              </TabsTrigger>
              <TabsTrigger value="dejeuner" className="flex flex-col items-center gap-2">
                <Utensils className="h-5 w-5" />
                <span>Déjeuner</span>
              </TabsTrigger>
              <TabsTrigger value="snacks" className="flex flex-col items-center gap-2">
                <Utensils className="h-5 w-5" />
                <span>Snacks</span>
              </TabsTrigger>
              <TabsTrigger value="diner" className="flex flex-col items-center gap-2">
                <Utensils className="h-5 w-5" />
                <span>Dîner</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Recipes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    {recipe.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-beyana-lightgreen/20 text-beyana-green border-beyana-green/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="font-playfair">{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-4 w-4" />
                      <span>{recipe.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="h-4 w-4" />
                      <span>{recipe.cookTime}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-beyana-green text-beyana-green hover:bg-beyana-green hover:text-white"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Voir la recette
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Aucune recette ne correspond à votre recherche.</p>
              <Button 
                variant="link" 
                className="mt-2 text-beyana-green"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
        
        {/* Newsletter section */}
        <div className="mt-20 bg-beyana-lightgreen/30 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-playfair font-bold text-beyana-green mb-4">
            Recevez nos nouvelles recettes
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir nos nouvelles recettes, conseils nutritionnels et offres spéciales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Votre email" 
              className="border-beyana-green/30 focus-visible:ring-beyana-green" 
            />
            <Button className="bg-beyana-green hover:bg-beyana-darkgreen">
              S'inscrire
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipesPage;
