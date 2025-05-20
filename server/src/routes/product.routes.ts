import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSimilarProducts,
  updateProductStock
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Routes publiques
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/similar', getSimilarProducts);

// Routes protégées (nécessitent une authentification et des autorisations)
router.post('/', authenticate, authorize(UserRole.ADMIN), createProduct);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateProduct);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteProduct);
router.put('/:id/stock', authenticate, authorize(UserRole.ADMIN), updateProductStock);

export default router;
