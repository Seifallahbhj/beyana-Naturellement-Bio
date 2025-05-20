import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';

const router = express.Router();

// Préfixe API v1
const apiV1 = '/api/v1';

// Montage des routes
router.use(`${apiV1}/auth`, authRoutes);
router.use(`${apiV1}/products`, productRoutes);
router.use(`${apiV1}/categories`, categoryRoutes);
router.use(`${apiV1}/orders`, orderRoutes);
router.use(`${apiV1}/reviews`, reviewRoutes);

// Route spéciale pour les avis d'un produit
// Rediriger les routes de reviews de produits spécifiques
router.use(`${apiV1}/products/:productId/reviews`, (req: Request, res: Response, next: NextFunction) => {
  // Utiliser le routeur des avis pour cette route
  const productId = req.params.productId;
  req.query.productId = productId;
  // Utiliser le middleware suivant
  next();
});

// Monter le routeur des avis après le middleware de paramètres
router.use(`${apiV1}/products/:productId/reviews`, reviewRoutes);

export default router;
