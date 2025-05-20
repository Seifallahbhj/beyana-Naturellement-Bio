import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Category from '../models/category.model';
import Product from '../models/product.model';
import { AppError, catchAsync } from '../middlewares/errorHandler';

// @desc    Récupérer toutes les catégories avec filtres
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Construire la requête
  let query: any = {};
  
  // Filtrer par niveau (catégories principales ou sous-catégories)
  if (req.query.level !== undefined) {
    query.level = parseInt(req.query.level as string);
  }
  
  // Filtrer par parent (pour obtenir les sous-catégories d'une catégorie spécifique)
  if (req.query.parent) {
    if (req.query.parent === 'null') {
      query.parent = null; // Catégories principales
    } else {
      query.parent = req.query.parent;
    }
  }
  
  // Filtrer par statut d'activation
  if (req.query.active !== undefined) {
    query.active = req.query.active === 'true';
  }
  
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
    sort = { name: 1 }; // Par défaut, tri par nom
  }
  
  // Exécuter la requête
  const categories = await Category.find(query)
    .sort(sort)
    .populate('parent', 'name slug');
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Récupérer une catégorie par son slug
// @route   GET /api/v1/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('parent', 'name slug');
  
  if (!category) {
    return next(new AppError('Catégorie non trouvée', 404));
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Récupérer une catégorie par son ID
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug');
  
  if (!category) {
    return next(new AppError('Catégorie non trouvée', 404));
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Créer une nouvelle catégorie
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si la catégorie parente existe
  if (req.body.parent) {
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new AppError('Catégorie parente non trouvée', 404));
    }
  }
  
  // Créer la catégorie
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Mettre à jour une catégorie
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si la catégorie parente existe
  if (req.body.parent) {
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new AppError('Catégorie parente non trouvée', 404));
    }
    
    // Vérifier que la catégorie ne devient pas son propre parent ou grand-parent
    if (req.body.parent.toString() === req.params.id) {
      return next(new AppError('Une catégorie ne peut pas être son propre parent', 400));
    }
    
    // Vérifier les relations circulaires
    let currentParent = parentCategory;
    while (currentParent.parent) {
      if (currentParent.parent.toString() === req.params.id) {
        return next(new AppError('Relation circulaire détectée', 400));
      }
      currentParent = await Category.findById(currentParent.parent);
    }
  }
  
  // Mettre à jour la catégorie
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!category) {
    return next(new AppError('Catégorie non trouvée', 404));
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Supprimer une catégorie
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('Catégorie non trouvée', 404));
  }
  
  // Vérifier si la catégorie a des sous-catégories
  const hasSubcategories = await Category.exists({ parent: req.params.id });
  if (hasSubcategories) {
    return next(new AppError('Cette catégorie a des sous-catégories. Veuillez les supprimer d\'abord', 400));
  }
  
  // Vérifier si la catégorie a des produits associés
  const hasProducts = await Product.exists({ category: req.params.id });
  if (hasProducts) {
    return next(new AppError('Cette catégorie a des produits associés. Veuillez les supprimer ou les déplacer d\'abord', 400));
  }
  
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Catégorie supprimée avec succès'
  });
});

// @desc    Récupérer les sous-catégories d'une catégorie
// @route   GET /api/v1/categories/:id/subcategories
// @access  Public
export const getSubcategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subcategories = await Category.find({ parent: req.params.id });
  
  res.status(200).json({
    success: true,
    count: subcategories.length,
    data: subcategories
  });
});

// @desc    Récupérer le chemin complet d'une catégorie (pour les fils d'Ariane)
// @route   GET /api/v1/categories/:id/path
// @access  Public
export const getCategoryPath = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('Catégorie non trouvée', 404));
  }
  
  // Récupérer le chemin complet de la catégorie
  const path = await Category.getCategoryPath(req.params.id);
  
  res.status(200).json({
    success: true,
    data: path
  });
});

// @desc    Récupérer les produits d'une catégorie
// @route   GET /api/v1/categories/:id/products
// @access  Public
export const getCategoryProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError('Catégorie non trouvée', 404));
  }
  
  // Récupérer tous les IDs de sous-catégories
  const subcategories = await Category.find({ parent: req.params.id });
  const categoryIds = [req.params.id, ...subcategories.map(subcat => subcat._id)];
  
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
  
  // Récupérer les produits
  const products = await Product.find({ category: { $in: categoryIds } })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug');
  
  // Compter le nombre total de produits pour la pagination
  const total = await Product.countDocuments({ category: { $in: categoryIds } });
  
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
