import mongoose, { Schema, Document } from 'mongoose';

// Interface pour le document Review
export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  likes: number;
  approved: string;
  isApproved: boolean; // Ajout pour compatibilité avec le contrôleur
  helpfulCount: number; // Ajout pour compatibilité avec le contrôleur
}

// Enum pour le statut d'approbation
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Schéma avis
const reviewSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [1, 'La note minimale est 1'],
    max: [5, 'La note maximale est 5']
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  comment: {
    type: String,
    required: [true, 'Le commentaire est requis'],
    trim: true
  },
  images: {
    type: [String],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 5;
      },
      message: 'Vous ne pouvez pas ajouter plus de 5 images'
    }
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de j\'aime ne peut pas être négatif']
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de votes utiles ne peut pas être négatif']
  },
  approved: {
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.PENDING
  }
}, {
  timestamps: true
});

// Index unique pour empêcher un utilisateur de soumettre plusieurs avis pour le même produit
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Middleware pour mettre à jour la note moyenne du produit après l'ajout d'un avis
reviewSchema.post('save', async function() {
  // @ts-ignore
  await this.constructor.calcAverageRating(this.product);
});

// Middleware pour mettre à jour la note moyenne du produit après la suppression d'un avis
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  // @ts-ignore
  await this.constructor.calcAverageRating(this.product);
});

// Getter virtuel pour isApproved
reviewSchema.virtual('isApproved').get(function() {
  return this.approved === ApprovalStatus.APPROVED;
});

// Interface pour les méthodes statiques du modèle Review
interface ReviewModel extends mongoose.Model<IReview> {
  calcAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
  hasUserPurchasedProduct(userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId): Promise<boolean>;
  getMostHelpfulReviews(productId: mongoose.Types.ObjectId, limit?: number): Promise<IReview[]>;
}

// Méthode statique pour calculer la note moyenne d'un produit
reviewSchema.statics.calcAverageRating = async function(productId: mongoose.Types.ObjectId): Promise<void> {
  const stats = await this.aggregate([
    {
      $match: { 
        product: productId,
        approved: ApprovalStatus.APPROVED
      }
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
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: stats[0].avgRating,
      numReviews: stats[0].numReviews
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// Méthode statique pour vérifier si un utilisateur a acheté le produit
reviewSchema.statics.hasUserPurchasedProduct = async function(userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId): Promise<boolean> {
  const Order = mongoose.model('Order');
  const orders = await Order.find({
    user: userId,
    'items.product': productId,
    status: { $in: ['delivered', 'shipped'] }
  });
  
  return orders.length > 0;
};

// Méthode statique pour obtenir les avis les plus utiles
reviewSchema.statics.getMostHelpfulReviews = async function(productId: mongoose.Types.ObjectId, limit: number = 5): Promise<IReview[]> {
  return this.find({
    product: productId,
    approved: ApprovalStatus.APPROVED
  })
  .sort({ likes: -1, createdAt: -1 })
  .limit(limit)
  .populate('user', 'firstName lastName');
};

const Review = mongoose.model<IReview, ReviewModel>('Review', reviewSchema);

export default Review;
