import express from 'express';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Routes protégées (nécessitent une authentification)
router.post('/', authenticate, createOrder);
router.get('/me', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/cancel', authenticate, cancelOrder);

// Routes admin (nécessitent des autorisations administrateur)
router.get('/', authenticate, authorize(UserRole.ADMIN), getOrders);
router.put('/:id/status', authenticate, authorize(UserRole.ADMIN), updateOrderStatus);
router.put('/:id/payment', authenticate, authorize(UserRole.ADMIN), updatePaymentStatus);
router.get('/stats', authenticate, authorize(UserRole.ADMIN), getOrderStats);

export default router;
