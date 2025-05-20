import express from 'express';
import {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  likeReview,
  getMostHelpfulReviews,
  getPendingReviews
} from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Routes publiques
router.get('/most-helpful', getMostHelpfulReviews);
router.get('/:id', getReviewById);

// Routes protégées (nécessitent une authentification)
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.put('/:id/like', authenticate, likeReview);

// Routes admin (nécessitent des autorisations administrateur)
router.put('/:id/approve', authenticate, authorize(UserRole.ADMIN), approveReview);
router.get('/pending', authenticate, authorize(UserRole.ADMIN), getPendingReviews);

// Route pour obtenir les avis d'un produit (définie ici mais sera utilisée avec le préfixe /products/:productId)
router.get('/products/:productId/reviews', getProductReviews);

export default router;
