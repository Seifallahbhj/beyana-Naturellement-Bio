import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/category.model';
import Product from '../models/product.model';
import { ICategory } from '../models/category.model';

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

// Données de catégories
const categories = [
  {
    name: 'Petit-déjeuner',
    slug: 'petit-dejeuner',
    description: 'Produits pour bien commencer la journée',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 1,
    isActive: true
  },
  {
    name: 'Superaliments',
    slug: 'superaliments',
    description: 'Aliments riches en nutriments essentiels',
    image: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 1,
    isActive: true
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    description: 'Collations saines pour toute la journée',
    image: 'https://images.unsplash.com/photo-1562304822-9340c3249ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 1,
    isActive: true
  },
  {
    name: 'Boissons',
    slug: 'boissons',
    description: 'Boissons naturelles et rafraîchissantes',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    level: 1,
    isActive: true
  }
];

// Fonction pour créer les produits
const createProducts = async (categoryMap: Map<string, mongoose.Types.ObjectId>) => {
  // Produits pour la catégorie Petit-déjeuner
  const breakfastProducts = [
    {
      name: 'Granola protéiné',
      slug: 'granola-proteine',
      description: 'Un granola riche en protéines, parfait pour commencer la journée avec énergie. Fabriqué à partir d\'ingrédients biologiques de haute qualité.',
      price: 9.99,
      images: ['https://images.unsplash.com/photo-1504708706948-13d6cbba4062?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      category: categoryMap.get('petit-dejeuner'),
      nutritionalInfo: {
        calories: 420,
        protein: 15,
        carbs: 45,
        sugar: 10,
        fat: 18,
        saturatedFat: 3,
        fiber: 8,
        salt: 0.2,
        servingSize: '100g'
      },
      ingredients: ['Flocons d\'avoine complets', 'Miel', 'Amandes', 'Graines de chia', 'Protéine de pois', 'Huile de coco'],
      allergens: ['Fruits à coque'],
      countryOfOrigin: 'France',
      isOrganic: true,
      isVegan: false,
      isGlutenFree: false,
      stock: 50,
      sold: 15,
      rating: 4.7,
      numReviews: 12,
      featured: true
    },
    {
      name: 'Porridge aux fruits rouges',
      slug: 'porridge-fruits-rouges',
      description: 'Porridge crémeux aux fruits rouges, riche en fibres et en vitamines. Prêt en quelques minutes pour un petit-déjeuner équilibré.',
      price: 7.50,
      images: ['https://images.unsplash.com/photo-1613082410785-22292e8426e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8UG9ycmlkZ2UlMjBhdXglMjBmcnVpdHMlMjByb3VnZXN8ZW58MHx8MHx8fDA%3D'],
      category: categoryMap.get('petit-dejeuner'),
      nutritionalInfo: {
        calories: 350,
        protein: 10,
        carbs: 60,
        sugar: 15,
        fat: 8,
        saturatedFat: 1.5,
        fiber: 12,
        salt: 0.1,
        servingSize: '100g'
      },
      ingredients: ['Flocons d\'avoine', 'Fraises lyophilisées', 'Framboises lyophilisées', 'Sucre de coco', 'Graines de lin'],
      allergens: ['Peut contenir des traces de gluten'],
      countryOfOrigin: 'France',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: false,
      stock: 35,
      sold: 8,
      rating: 4.5,
      numReviews: 6,
      featured: false
    }
  ];

  // Produits pour la catégorie Superaliments
  const superfoodProducts = [
    {
      name: 'Poudre de spiruline',
      slug: 'poudre-spiruline',
      description: 'Spiruline 100% pure et naturelle, riche en protéines, fer et antioxydants. Un superaliment complet pour booster votre système immunitaire.',
      price: 15.99,
      images: ['https://images.unsplash.com/photo-1664956618676-9e65fe31a165?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8UG91ZHJlJTIwZGUlMjBzcGlydWxpbmV8ZW58MHx8MHx8fDA%3D'],
      category: categoryMap.get('superaliments'),
      nutritionalInfo: {
        calories: 290,
        protein: 57,
        carbs: 24,
        sugar: 0,
        fat: 8,
        saturatedFat: 2.2,
        fiber: 3.6,
        salt: 0.9,
        servingSize: '100g'
      },
      ingredients: ['Spiruline (Arthrospira platensis) 100% pure'],
      allergens: [],
      countryOfOrigin: 'France',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      stock: 40,
      sold: 22,
      rating: 4.8,
      numReviews: 18,
      featured: true
    },
    {
      name: 'Baies de Goji',
      slug: 'baies-goji',
      description: 'Baies de Goji séchées, riches en antioxydants et en vitamines. Parfaites pour les smoothies, müeslis ou en-cas.',
      price: 12.50,
      images: ['https://images.unsplash.com/photo-1654600870472-7c4afe2f70e1?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      category: categoryMap.get('superaliments'),
      nutritionalInfo: {
        calories: 349,
        protein: 14,
        carbs: 77,
        sugar: 46,
        fat: 0.4,
        saturatedFat: 0.1,
        fiber: 13,
        salt: 0,
        servingSize: '100g'
      },
      ingredients: ['Baies de Goji séchées (Lycium barbarum)'],
      allergens: [],
      countryOfOrigin: 'Chine',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      stock: 30,
      sold: 14,
      rating: 4.6,
      numReviews: 9,
      featured: false
    }
  ];

  // Produits pour la catégorie Snacks
  const snackProducts = [
    {
      name: 'Mix de noix bio',
      slug: 'mix-noix-bio',
      description: 'Mélange de noix de qualité biologique : amandes, noix de cajou, noisettes et noix du Brésil. Riche en acides gras essentiels et en protéines.',
      price: 12.50,
      images: ['https://images.unsplash.com/photo-1614807618309-9de716b16eac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fE1peCUyMGRlJTIwbm9peHxlbnwwfHwwfHx8MA%3D%3D'],
      category: categoryMap.get('snacks'),
      nutritionalInfo: {
        calories: 650,
        protein: 20,
        carbs: 12,
        sugar: 4,
        fat: 60,
        saturatedFat: 8,
        fiber: 10,
        salt: 0.01,
        servingSize: '100g'
      },
      ingredients: ['Amandes*', 'Noix de cajou*', 'Noisettes*', 'Noix du Brésil*', '* issus de l\'agriculture biologique'],
      allergens: ['Fruits à coque'],
      countryOfOrigin: 'UE/non-UE',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      stock: 45,
      sold: 28,
      rating: 4.9,
      numReviews: 24,
      featured: true
    },
    {
      name: 'Barres énergétiques aux dattes',
      slug: 'barres-energetiques-dattes',
      description: 'Barres énergétiques naturelles à base de dattes, noix et cacao. Sans sucres ajoutés, idéales avant ou après l\'effort.',
      price: 8.99,
      images: ['https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      category: categoryMap.get('snacks'),
      nutritionalInfo: {
        calories: 380,
        protein: 8,
        carbs: 58,
        sugar: 42,
        fat: 15,
        saturatedFat: 3,
        fiber: 7,
        salt: 0.05,
        servingSize: '100g'
      },
      ingredients: ['Dattes', 'Amandes', 'Cacao cru', 'Huile de coco'],
      allergens: ['Fruits à coque'],
      countryOfOrigin: 'France',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      stock: 60,
      sold: 32,
      rating: 4.7,
      numReviews: 15,
      featured: false
    }
  ];

  // Produits pour la catégorie Boissons
  const drinkProducts = [
    {
      name: 'Kombucha Gingembre Citron',
      slug: 'kombucha-gingembre-citron',
      description: 'Boisson fermentée naturellement pétillante au gingembre et citron. Riche en probiotiques pour une bonne santé digestive.',
      price: 4.99,
      images: ['https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      category: categoryMap.get('boissons'),
      nutritionalInfo: {
        calories: 25,
        protein: 0,
        carbs: 6,
        sugar: 5,
        fat: 0,
        saturatedFat: 0,
        fiber: 0,
        salt: 0,
        servingSize: '100ml'
      },
      ingredients: ['Eau filtrée', 'Thé vert', 'Sucre de canne non raffiné', 'Culture de kombucha', 'Gingembre', 'Citron'],
      allergens: [],
      countryOfOrigin: 'France',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      stock: 80,
      sold: 45,
      rating: 4.8,
      numReviews: 30,
      featured: true
    },
    {
      name: 'Lait d\'amande bio',
      slug: 'lait-amande-bio',
      description: 'Lait d\'amande bio non sucré, naturellement riche en vitamine E. Parfait pour les smoothies, céréales ou pâtisseries.',
      price: 3.50,
      images: ['https://images.unsplash.com/photo-1600718374662-0483d2b9da44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      category: categoryMap.get('boissons'),
      nutritionalInfo: {
        calories: 30,
        protein: 1.1,
        carbs: 0.2,
        sugar: 0.1,
        fat: 2.7,
        saturatedFat: 0.2,
        fiber: 0.5,
        salt: 0.13,
        servingSize: '100ml'
      },
      ingredients: ['Eau', 'Amandes* (7%)', '* issu de l\'agriculture biologique'],
      allergens: ['Fruits à coque'],
      countryOfOrigin: 'France',
      isOrganic: true,
      isVegan: true,
      isGlutenFree: true,
      stock: 65,
      sold: 38,
      rating: 4.6,
      numReviews: 22,
      featured: false
    }
  ];

  // Combiner tous les produits
  const allProducts = [
    ...breakfastProducts,
    ...superfoodProducts,
    ...snackProducts,
    ...drinkProducts
  ];

  // Insérer les produits dans la base de données
  try {
    await Product.deleteMany({});
    console.log('Produits supprimés');
    
    await Product.insertMany(allProducts);
    console.log(`${allProducts.length} produits insérés`);
  } catch (error) {
    console.error(`Erreur lors de l'insertion des produits: ${error.message}`);
    process.exit(1);
  }
};

// Fonction principale pour le seeding
const seedData = async () => {
  try {
    const conn = await connectDB();
    
    // Supprimer les données existantes
    await Category.deleteMany({});
    console.log('Catégories supprimées');
    
    // Insérer les nouvelles catégories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} catégories insérées`);
    
    // Créer une map des catégories pour référence facile
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    createdCategories.forEach((category: ICategory) => {
      categoryMap.set(category.slug, category._id);
    });
    
    // Créer les produits
    await createProducts(categoryMap);
    
    console.log('Seeding terminé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error(`Erreur lors du seeding: ${error.message}`);
    process.exit(1);
  }
};

// Exécuter le seeding
seedData();
