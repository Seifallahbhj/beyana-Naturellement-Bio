import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  getCategoryPath,
  getCategoryProducts
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Routes publiques
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.get('/:id/subcategories', getSubcategories);
router.get('/:id/path', getCategoryPath);
router.get('/:id/products', getCategoryProducts);

// Routes protégées (nécessitent une authentification et des autorisations)
router.post('/', authenticate, authorize(UserRole.ADMIN), createCategory);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateCategory);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteCategory);

export default router;
