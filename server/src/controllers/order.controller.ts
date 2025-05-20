import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order, { OrderStatus } from '../models/order.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import { AppError, catchAsync } from '../middlewares/errorHandler';

// @desc    Créer une nouvelle commande
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  
  if (!items || items.length === 0) {
    return next(new AppError('Veuillez ajouter au moins un produit à votre commande', 400));
  }
  
  // Vérifier la disponibilité des produits et calculer le prix total
  let itemsPrice = 0;
  const orderItems = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Produit non trouvé: ${item.product}`, 404));
    }
    
    if (product.stock < item.quantity) {
      return next(new AppError(`Quantité insuffisante pour ${product.name}. Disponible: ${product.stock}`, 400));
    }
    
    const price = product.discountPrice || product.price;
    const itemTotal = price * item.quantity;
    itemsPrice += itemTotal;
    
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price,
      quantity: item.quantity
    });
  }
  
  // Calculer les taxes et les frais de livraison
  const taxRate = 0.2; // 20% TVA
  const taxPrice = itemsPrice * taxRate;
  
  // Frais de livraison gratuits pour les commandes de plus de 50€
  const shippingPrice = itemsPrice > 50 ? 0 : 4.99;
  
  // Prix total
  const totalPrice = itemsPrice + taxPrice + shippingPrice;
  
  // Calculer les points de fidélité (1 point pour chaque 10€ dépensés)
  const loyaltyPoints = Math.floor(itemsPrice / 10);
  
  // Créer la commande
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'pending',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    loyaltyPoints
  });
  
  // Mettre à jour le stock des produits
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity, sold: item.quantity } }
    );
  }
  
  // Ajouter les points de fidélité à l'utilisateur
  await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { loyaltyPoints } }
  );
  
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Récupérer toutes les commandes (admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
export const getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Filtres
  let query: any = {};
  
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }
  
  // Recherche par numéro de commande
  if (req.query.orderNumber) {
    query.orderNumber = req.query.orderNumber;
  }
  
  // Recherche par utilisateur
  if (req.query.user) {
    query.user = req.query.user;
  }
  
  // Recherche par date
  if (req.query.startDate && req.query.endDate) {
    query.createdAt = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string)
    };
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Tri
  let sort: any = {};
  if (req.query.sort) {
    const sortFields = (req.query.sort as string).split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });
  } else {
    sort = { createdAt: -1 };
  }
  
  // Exécuter la requête
  const orders = await Order.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email');
  
  // Compter le nombre total de commandes pour la pagination
  const total = await Order.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Récupérer les commandes de l'utilisateur connecté
// @route   GET /api/v1/orders/me
// @access  Private
export const getMyOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Filtres
  let query: any = { user: req.user.id };
  
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Tri (par défaut, les plus récentes d'abord)
  const sort = { createdAt: -1 as -1 };
  
  // Exécuter la requête
  const orders = await Order.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  // Compter le nombre total de commandes pour la pagination
  const total = await Order.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Récupérer une commande par son ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email');
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est autorisé à voir cette commande
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Non autorisé', 403));
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Mettre à jour le statut d'une commande
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new AppError('Veuillez fournir un statut', 400));
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }
  
  // Mettre à jour le statut
  order.status = status;
  await order.save();
  
  // TODO: Envoyer un email de notification au client
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Mettre à jour le statut de paiement
// @route   PUT /api/v1/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { paymentStatus, transactionId } = req.body;
  
  if (!paymentStatus) {
    return next(new AppError('Veuillez fournir un statut de paiement', 400));
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }
  
  // Mettre à jour le statut de paiement
  order.paymentStatus = paymentStatus;
  if (transactionId) {
    order.paymentInfo.transactionId = transactionId;
  }
  
  await order.save();
  
  // TODO: Envoyer un email de confirmation de paiement au client
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Annuler une commande
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est autorisé à annuler cette commande
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Non autorisé', 403));
  }
  
  // Vérifier que la commande peut être annulée
  if (order.status !== 'pending' && order.status !== 'processing') {
    return next(new AppError('Cette commande ne peut plus être annulée', 400));
  }
  
  // Mettre à jour le statut
  order.status = OrderStatus.CANCELLED;
  await order.save();
  
  // Restaurer le stock des produits
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity, sold: -item.quantity } }
    );
  }
  
  // Retirer les points de fidélité si la commande a été payée
  if (order.paymentStatus === 'paid') {
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { loyaltyPoints: -order.loyaltyPoints } }
    );
  }
  
  // TODO: Envoyer un email de confirmation d'annulation au client
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Obtenir des statistiques sur les commandes
// @route   GET /api/v1/orders/stats
// @access  Private/Admin
export const getOrderStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Période (par défaut, le mois en cours)
  const startDate = req.query.startDate 
    ? new Date(req.query.startDate as string) 
    : new Date(new Date().setDate(1)); // Premier jour du mois en cours
  
  const endDate = req.query.endDate 
    ? new Date(req.query.endDate as string) 
    : new Date(); // Aujourd'hui
  
  // Statistiques générales
  const stats = await Order.getOrderStats(startDate, endDate);
  
  // Ventes par jour
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        total: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  // Produits les plus vendus
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: 5
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      stats,
      dailySales,
      topProducts
    }
  });
});
