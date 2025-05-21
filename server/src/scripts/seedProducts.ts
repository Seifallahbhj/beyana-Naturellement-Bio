import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/product.model';
import Category from '../models/category.model';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beyana');
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Données de test pour les catégories
const categories = [
  {
    name: 'Superaliments',
    slug: 'superaliments',
    description: 'Aliments riches en nutriments essentiels pour votre santé.',
    level: 0,
    isActive: true
  },
  {
    name: 'Fruits secs',
    slug: 'fruits-secs',
    description: 'Fruits déshydratés naturellement riches en fibres et en énergie.',
    level: 0,
    isActive: true
  },
  {
    name: 'Céréales & Légumineuses',
    slug: 'cereales-legumineuses',
    description: 'Sources essentielles de protéines végétales et de fibres.',
    level: 0,
    isActive: true
  }
];

// Fonction pour créer des catégories
const createCategories = async () => {
  try {
    // Supprimer toutes les catégories existantes
    await Category.deleteMany({});
    console.log('Catégories supprimées');

    // Créer de nouvelles catégories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} catégories créées`);
    return createdCategories;
  } catch (error) {
    console.error(`Erreur lors de la création des catégories: ${error.message}`);
    process.exit(1);
  }
};

// Fonction pour créer des produits
const createProducts = async (createdCategories: mongoose.Document[]) => {
  try {
    // Supprimer tous les produits existants
    await Product.deleteMany({});
    console.log('Produits supprimés');

    // Données de test pour les produits
    const products = [
      {
        name: 'Spiruline en poudre',
        slug: 'spiruline-en-poudre',
        description: 'La spiruline est une micro-algue riche en protéines, vitamines et minéraux. Elle est considérée comme un superaliment pour ses nombreux bienfaits sur la santé.',
        price: 12.99,
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1000&auto=format&fit=crop'],
        category: createdCategories[0]._id,
        nutritionalInfo: {
          calories: 290,
          protein: 57,
          carbs: 24,
          sugar: 3,
          fat: 8,
          saturatedFat: 2.5,
          fiber: 3.6,
          salt: 1.85,
          servingSize: '10g'
        },
        ingredients: ['Spiruline (Arthrospira platensis)'],
        allergens: [],
        countryOfOrigin: 'France',
        isOrganic: true,
        isVegan: true,
        isGlutenFree: true,
        stock: 50,
        sold: 10,
        rating: 4.7,
        numReviews: 15,
        featured: true
      },
      {
        name: 'Amandes Bio',
        slug: 'amandes-bio',
        description: 'Amandes biologiques de qualité supérieure, riches en protéines et en bons lipides. Idéales pour une collation saine ou en cuisine.',
        price: 8.50,
        images: ['https://images.unsplash.com/photo-1591368699127-d5a4e7e1d1c6?q=80&w=1000&auto=format&fit=crop'],
        category: createdCategories[1]._id,
        nutritionalInfo: {
          calories: 576,
          protein: 21,
          carbs: 22,
          sugar: 4,
          fat: 49,
          saturatedFat: 3.7,
          fiber: 12.5,
          salt: 0.01,
          servingSize: '100g'
        },
        ingredients: ['Amandes biologiques'],
        allergens: ['Fruits à coque'],
        countryOfOrigin: 'Espagne',
        isOrganic: true,
        isVegan: true,
        isGlutenFree: true,
        stock: 75,
        sold: 25,
        rating: 4.5,
        numReviews: 8,
        featured: false
      },
      {
        name: 'Quinoa Blanc',
        slug: 'quinoa-blanc',
        description: 'Le quinoa est une pseudo-céréale complète, riche en protéines végétales et en acides aminés essentiels. Facile à cuisiner et très polyvalent.',
        price: 5.99,
        images: ['https://images.unsplash.com/photo-1612549322133-5c4c90c1d2b1?q=80&w=1000&auto=format&fit=crop'],
        category: createdCategories[2]._id,
        nutritionalInfo: {
          calories: 368,
          protein: 14,
          carbs: 64,
          sugar: 2,
          fat: 6,
          saturatedFat: 0.7,
          fiber: 7,
          salt: 0.05,
          servingSize: '100g'
        },
        ingredients: ['Quinoa blanc (Chenopodium quinoa)'],
        allergens: [],
        countryOfOrigin: 'Pérou',
        isOrganic: true,
        isVegan: true,
        isGlutenFree: true,
        stock: 100,
        sold: 30,
        rating: 4.8,
        numReviews: 12,
        featured: true
      },
      {
        name: 'Poudre de Cacao Cru',
        slug: 'poudre-de-cacao-cru',
        description: 'Cacao cru biologique non torréfié, conservant tous ses nutriments et antioxydants. Parfait pour vos desserts et boissons chocolatées.',
        price: 9.95,
        images: ['https://images.unsplash.com/photo-1578614979874-a0f39c8c7bce?q=80&w=1000&auto=format&fit=crop'],
        category: createdCategories[0]._id,
        nutritionalInfo: {
          calories: 355,
          protein: 20,
          carbs: 34,
          sugar: 0.5,
          fat: 20,
          saturatedFat: 12,
          fiber: 33,
          salt: 0.02,
          servingSize: '100g'
        },
        ingredients: ['Poudre de cacao cru biologique'],
        allergens: [],
        countryOfOrigin: 'Pérou',
        isOrganic: true,
        isVegan: true,
        isGlutenFree: true,
        stock: 60,
        sold: 15,
        rating: 4.6,
        numReviews: 9,
        featured: false
      },
      {
        name: 'Lentilles Vertes',
        slug: 'lentilles-vertes',
        description: 'Lentilles vertes biologiques, source de protéines végétales et de fer. Idéales pour les salades, soupes et plats végétariens.',
        price: 3.75,
        images: ['https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=1000&auto=format&fit=crop'],
        category: createdCategories[2]._id,
        nutritionalInfo: {
          calories: 353,
          protein: 24,
          carbs: 60,
          sugar: 2,
          fat: 1.1,
          saturatedFat: 0.2,
          fiber: 11,
          salt: 0.03,
          servingSize: '100g'
        },
        ingredients: ['Lentilles vertes biologiques'],
        allergens: [],
        countryOfOrigin: 'France',
        isOrganic: true,
        isVegan: true,
        isGlutenFree: true,
        stock: 120,
        sold: 40,
        rating: 4.4,
        numReviews: 7,
        featured: false
      },
      {
        name: 'Baies de Goji',
        slug: 'baies-de-goji',
        description: 'Les baies de goji sont riches en antioxydants, vitamines et minéraux. Elles sont connues pour leurs propriétés énergisantes et anti-âge.',
        price: 14.50,
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1000&auto=format&fit=crop'],
        category: createdCategories[1]._id,
        nutritionalInfo: {
          calories: 349,
          protein: 14,
          carbs: 77,
          sugar: 46,
          fat: 0.4,
          saturatedFat: 0.1,
          fiber: 13,
          salt: 0.04,
          servingSize: '100g'
        },
        ingredients: ['Baies de goji séchées (Lycium barbarum)'],
        allergens: [],
        countryOfOrigin: 'Chine',
        isOrganic: true,
        isVegan: true,
        isGlutenFree: true,
        stock: 45,
        sold: 20,
        rating: 4.9,
        numReviews: 11,
        featured: true
      }
    ];

    // Créer de nouveaux produits
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} produits créés`);
  } catch (error) {
    console.error(`Erreur lors de la création des produits: ${error.message}`);
    process.exit(1);
  }
};

// Fonction principale
const seedDatabase = async () => {
  try {
    // Connexion à la base de données
    const conn = await connectDB();

    // Créer les catégories
    const createdCategories = await createCategories();

    // Créer les produits
    await createProducts(createdCategories);

    console.log('Base de données initialisée avec succès !');
    
    // Fermer la connexion
    await mongoose.disconnect();
    console.log('Connexion à MongoDB fermée');
    
    process.exit(0);
  } catch (error) {
    console.error(`Erreur lors de l'initialisation de la base de données: ${error.message}`);
    process.exit(1);
  }
};

// Exécuter la fonction
seedDatabase();
