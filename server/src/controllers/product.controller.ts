import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model';
import Category from '../models/category.model';
import { AppError, catchAsync } from '../middlewares/errorHandler';

// @desc    Récupérer tous les produits avec pagination et filtres
// @route   GET /api/v1/products
// @access  Public
export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Construire la requête
  let query: any = {};
  
  // Filtrage par mot-clé
  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }
  
  // Filtrage par catégorie
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (category) {
      query.category = category._id;
    }
  }
  
  // Filtrage par attributs spécifiques
  if (req.query.isOrganic) {
    query.isOrganic = req.query.isOrganic === 'true';
  }
  
  if (req.query.isVegan) {
    query.isVegan = req.query.isVegan === 'true';
  }
  
  if (req.query.isGlutenFree) {
    query.isGlutenFree = req.query.isGlutenFree === 'true';
  }
  
  // Filtrage par fourchette de prix
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = Number(req.query.maxPrice);
    }
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
  
  // Sélection de champs
  let select = '';
  if (req.query.fields) {
    select = (req.query.fields as string).split(',').join(' ');
  }
  
  // Exécuter la requête
  const products = await Product.find(query)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug');
  
  // Compter le nombre total de produits pour la pagination
  const total = await Product.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: products
  });
});

// @desc    Récupérer un produit par son slug
// @route   GET /api/v1/products/slug/:slug
// @access  Public
export const getProductBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug');
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Récupérer un produit par son ID
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug');
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Créer un nouveau produit
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si la catégorie existe
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new AppError('Catégorie non trouvée', 404));
    }
  }
  
  // Créer le produit
  const product = await Product.create(req.body);
  
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Mettre à jour un produit
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si la catégorie existe
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new AppError('Catégorie non trouvée', 404));
    }
  }
  
  // Mettre à jour le produit
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Supprimer un produit
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  await product.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Produit supprimé avec succès'
  });
});

// @desc    Récupérer les produits en vedette
// @route   GET /api/v1/products/featured
// @access  Public
export const getFeaturedProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 6;
  
  const products = await Product.find({ featured: true })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Récupérer des produits similaires
// @route   GET /api/v1/products/:id/similar
// @access  Public
export const getSimilarProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  const limit = parseInt(req.query.limit as string) || 4;
  
  const products = await Product.find({
    _id: { $ne: product._id },
    category: product.category
  })
    .limit(limit)
    .populate('category', 'name slug');
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Mettre à jour le stock d'un produit
// @route   PUT /api/v1/products/:id/stock
// @access  Private/Admin
export const updateProductStock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { stock } = req.body;
  
  if (stock === undefined) {
    return next(new AppError('Veuillez fournir la quantité en stock', 400));
  }
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});
