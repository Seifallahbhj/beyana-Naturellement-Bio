import mongoose, { Schema, Document } from 'mongoose';

// Interface pour le document Product
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    sugar: number;
    fat: number;
    saturatedFat: number;
    fiber: number;
    salt: number;
    servingSize: string;
  };
  ingredients: string[];
  allergens: string[];
  countryOfOrigin: string;
  isOrganic: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  featured: boolean;
}

// Schéma pour les informations nutritionnelles
const nutritionalInfoSchema = new Schema({
  calories: {
    type: Number,
    required: [true, 'Les calories sont requises']
  },
  protein: {
    type: Number,
    required: [true, 'La quantité de protéines est requise']
  },
  carbs: {
    type: Number,
    required: [true, 'La quantité de glucides est requise']
  },
  sugar: {
    type: Number,
    required: [true, 'La quantité de sucre est requise']
  },
  fat: {
    type: Number,
    required: [true, 'La quantité de matières grasses est requise']
  },
  saturatedFat: {
    type: Number,
    required: [true, 'La quantité de graisses saturées est requise']
  },
  fiber: {
    type: Number,
    required: [true, 'La quantité de fibres est requise']
  },
  salt: {
    type: Number,
    required: [true, 'La quantité de sel est requise']
  },
  servingSize: {
    type: String,
    required: [true, 'La taille de la portion est requise']
  }
}, { _id: false });

// Schéma produit
const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom du produit ne peut pas dépasser 100 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description du produit est requise'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix du produit est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Le prix de remise ne peut pas être négatif']
  },
  images: {
    type: [String],
    required: [true, 'Au moins une image est requise']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie du produit est requise']
  },
  nutritionalInfo: {
    type: nutritionalInfoSchema,
    required: [true, 'Les informations nutritionnelles sont requises']
  },
  ingredients: {
    type: [String],
    required: [true, 'Les ingrédients sont requis']
  },
  allergens: {
    type: [String],
    default: []
  },
  countryOfOrigin: {
    type: String,
    required: [true, 'Le pays d\'origine est requis']
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est requis'],
    min: [0, 'Le stock ne peut pas être négatif']
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de ventes ne peut pas être négatif']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'La note ne peut pas être inférieure à 0'],
    max: [5, 'La note ne peut pas être supérieure à 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre d\'avis ne peut pas être négatif']
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Middleware pour vérifier que le prix de remise est inférieur au prix normal
productSchema.pre<IProduct>('save', function(next) {
  if (this.discountPrice && this.discountPrice >= this.price) {
    const error = new Error('Le prix de remise doit être inférieur au prix normal');
    return next(error);
  }
  next();
});

// Interface pour les méthodes statiques du modèle Product
interface ProductModel extends mongoose.Model<IProduct> {
  updateAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
  updateProductRating(productId: mongoose.Types.ObjectId): Promise<void>;
}

// Méthode statique pour mettre à jour la note moyenne d'un produit
productSchema.statics.updateAverageRating = async function(productId: mongoose.Types.ObjectId): Promise<void> {
  // Utiliser mongoose.model directement au lieu de this.model
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      rating: stats[0].avgRating,
      numReviews: stats[0].numReviews
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// Alias pour updateAverageRating pour correspondre à l'utilisation dans le contrôleur
productSchema.statics.updateProductRating = async function(productId: mongoose.Types.ObjectId): Promise<void> {
  // Appel explicite à la méthode statique en utilisant le schéma
  return (this as ProductModel).updateAverageRating(productId);
};

const Product = mongoose.model<IProduct, ProductModel>('Product', productSchema);

export default Product;
