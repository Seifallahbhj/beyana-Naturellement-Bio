import mongoose, { Schema, Document } from 'mongoose';

// Interface pour les articles de la commande
interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

// Interface pour l'adresse de livraison
interface IShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Interface pour les informations de paiement
interface IPaymentInfo {
  method: string;
  status: string;
  transactionId?: string;
}

// Enum pour le statut de la commande
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Interface pour le document Order
export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: string; // Ajout de la propriété paymentStatus
  loyaltyPoints: number; // Ajout de la propriété loyaltyPoints
  loyaltyPointsEarned: number;
  deliveredAt?: Date;
}

// Schéma pour les articles de la commande
const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité doit être au moins 1']
  }
}, { _id: false });

// Schéma pour l'adresse de livraison
const shippingAddressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  city: {
    type: String,
    required: [true, 'La ville est requise']
  },
  postalCode: {
    type: String,
    required: [true, 'Le code postal est requis']
  },
  country: {
    type: String,
    required: [true, 'Le pays est requis'],
    default: 'France'
  }
}, { _id: false });

// Schéma pour les informations de paiement
const paymentInfoSchema = new Schema({
  method: {
    type: String,
    required: [true, 'La méthode de paiement est requise'],
    enum: ['card', 'paypal', 'stripe']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded']
  },
  transactionId: {
    type: String
  }
}, { _id: false });

// Schéma commande
const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'La commande doit contenir au moins un article'
    }
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentInfo: {
    type: paymentInfoSchema,
    required: true
  },
  itemsPrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix des articles ne peut pas être négatif']
  },
  taxPrice: {
    type: Number,
    required: true,
    min: [0, 'Le montant des taxes ne peut pas être négatif']
  },
  shippingPrice: {
    type: Number,
    required: true,
    min: [0, 'Les frais de livraison ne peuvent pas être négatifs']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Le prix total ne peut pas être négatif']
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Les points de fidélité ne peuvent pas être négatifs']
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: [0, 'Les points de fidélité ne peuvent pas être négatifs']
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Middleware pour générer un numéro de commande unique
orderSchema.pre<IOrder>('save', async function(next) {
  if (!this.isNew) return next();
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const count = await mongoose.model('Order').countDocuments();
  const sequence = (count + 1).toString().padStart(4, '0');
  
  this.orderNumber = `BEY-${year}${month}${day}-${sequence}`;
  next();
});

// Middleware pour calculer automatiquement les points de fidélité
orderSchema.pre<IOrder>('save', function(next) {
  if (this.isNew || this.isModified('totalPrice')) {
    // Attribution de points de fidélité (1 point pour chaque 10€ dépensés)
    this.loyaltyPointsEarned = Math.floor(this.totalPrice / 10);
  }
  next();
});

// Middleware pour mettre à jour le stock des produits après une commande
orderSchema.post<IOrder>('save', async function() {
  if (this.status === OrderStatus.PROCESSING) {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }
  }
});

// Interface pour les méthodes statiques du modèle Order
interface OrderModel extends mongoose.Model<IOrder> {
  getSalesStats(startDate: Date, endDate: Date): Promise<any[]>;
  getOrderStats(startDate: Date, endDate: Date): Promise<any[]>;
}

// Méthode statique pour obtenir des statistiques de vente
orderSchema.statics.getSalesStats = async function(startDate: Date, endDate: Date): Promise<any[]> {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalPrice' },
        numberOfOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);
};

// Méthode statique pour obtenir des statistiques complètes sur les commandes
orderSchema.statics.getOrderStats = async function(startDate: Date, endDate: Date): Promise<any> {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' },
        totalTax: { $sum: '$taxPrice' },
        totalShipping: { $sum: '$shippingPrice' }
      }
    }
  ]);

  // Statistiques par statut
  const statusStats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  return {
    summary: stats.length > 0 ? stats[0] : {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalTax: 0,
      totalShipping: 0
    },
    byStatus: statusStats
  };
};

const Order = mongoose.model<IOrder, OrderModel>('Order', orderSchema);

export default Order;
