import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Review from '../models/review.model';
import Product from '../models/product.model';
import Order from '../models/order.model';
import { AppError, catchAsync } from '../middlewares/errorHandler';

// @desc    Créer un nouvel avis
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { product, rating, title, comment, images } = req.body;
  
  // Vérifier si le produit existe
  const productExists = await Product.findById(product);
  if (!productExists) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  // Vérifier si l'utilisateur a acheté le produit
  // Convertir l'ID utilisateur en ObjectId
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const hasPurchased = await Review.hasUserPurchasedProduct(userId, product);
  if (!hasPurchased) {
    return next(new AppError('Vous devez acheter ce produit avant de pouvoir laisser un avis', 403));
  }
  
  // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
  const existingReview = await Review.findOne({
    user: req.user.id,
    product
  });
  
  if (existingReview) {
    return next(new AppError('Vous avez déjà laissé un avis pour ce produit', 400));
  }
  
  // Limiter le nombre d'images
  if (images && images.length > 5) {
    return next(new AppError('Vous ne pouvez pas télécharger plus de 5 images', 400));
  }
  
  // Créer l'avis
  const review = await Review.create({
    user: req.user.id,
    product,
    rating,
    title,
    comment,
    images,
    verifiedPurchase: true
  });
  
  // Mettre à jour la note moyenne du produit
  await Product.updateProductRating(product);
  
  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Récupérer tous les avis d'un produit
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
export const getProductReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si le produit existe
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  // Filtres
  let query: any = { product: req.params.productId };
  
  // Par défaut, n'afficher que les avis approuvés pour les utilisateurs normaux
  if (req.user?.role !== 'admin') {
    query.isApproved = true;
  }
  
  // Filtrer par note
  if (req.query.rating) {
    query.rating = parseInt(req.query.rating as string);
  }
  
  // Filtrer par achat vérifié
  if (req.query.verifiedPurchase) {
    query.verifiedPurchase = req.query.verifiedPurchase === 'true';
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
    // Par défaut, trier par date (plus récents d'abord)
    sort = { createdAt: -1 };
  }
  
  // Exécuter la requête
  const reviews = await Review.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName');
  
  // Compter le nombre total d'avis pour la pagination
  const total = await Review.countDocuments(query);
  
  // Obtenir la distribution des notes
  const ratingDistribution = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  const distribution: { [key: number]: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  ratingDistribution.forEach(item => {
    if (item._id >= 1 && item._id <= 5) {
      distribution[item._id] = item.count;
    }
  });
  
  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    ratingDistribution: distribution,
    data: reviews
  });
});

// @desc    Récupérer un avis par son ID
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReviewById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'firstName lastName')
    .populate('product', 'name slug images');
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }
  
  // Vérifier si l'avis est approuvé ou si l'utilisateur est admin ou le propriétaire de l'avis
  if (!review.isApproved && req.user?.role !== 'admin' && review.user._id.toString() !== req.user?.id) {
    return next(new AppError('Non autorisé', 403));
  }
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Mettre à jour un avis
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }
  
  // Vérifier que l'utilisateur est autorisé à modifier cet avis
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Non autorisé', 403));
  }
  
  // Limiter le nombre d'images
  if (req.body.images && req.body.images.length > 5) {
    return next(new AppError('Vous ne pouvez pas télécharger plus de 5 images', 400));
  }
  
  // Mettre à jour l'avis
  review = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  // Si la note a été modifiée, mettre à jour la note moyenne du produit
  if (req.body.rating) {
    await Product.updateProductRating(review!.product);
  }
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Supprimer un avis
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }
  
  // Vérifier que l'utilisateur est autorisé à supprimer cet avis
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Non autorisé', 403));
  }
  
  await review.deleteOne();
  
  // Mettre à jour la note moyenne du produit
  await Product.updateProductRating(review.product);
  
  res.status(200).json({
    success: true,
    message: 'Avis supprimé avec succès'
  });
});

// @desc    Approuver ou rejeter un avis
// @route   PUT /api/v1/reviews/:id/approve
// @access  Private/Admin
export const approveReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { isApproved } = req.body;
  
  if (isApproved === undefined) {
    return next(new AppError('Veuillez spécifier si l\'avis est approuvé ou non', 400));
  }
  
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved },
    { new: true }
  );
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }
  
  // Si l'avis est approuvé, mettre à jour la note moyenne du produit
  if (isApproved) {
    await Product.updateProductRating(review.product);
  }
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Ajouter un "j'aime" à un avis
// @route   PUT /api/v1/reviews/:id/like
// @access  Private
export const likeReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }
  
  // Incrémenter le compteur de "j'aime"
  review.helpfulCount += 1;
  await review.save();
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Récupérer les avis les plus utiles
// @route   GET /api/v1/reviews/most-helpful
// @access  Public
export const getMostHelpfulReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 5;
  
  // Convertir le limit en nombre pour la méthode getMostHelpfulReviews
  // La méthode doit être adaptée pour accepter un nombre plutôt qu'un ObjectId
  const reviews = await Review.getMostHelpfulReviews(limit as any);
  
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Récupérer les avis en attente d'approbation
// @route   GET /api/v1/reviews/pending
// @access  Private/Admin
export const getPendingReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Récupérer les avis en attente
  const reviews = await Review.find({ isApproved: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName')
    .populate('product', 'name slug images');
  
  // Compter le nombre total d'avis en attente
  const total = await Review.countDocuments({ isApproved: false });
  
  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: reviews
  });
});
