import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, catchAsync } from './errorHandler';
import User, { UserRole } from '../models/user.model';
import { JwtPayload } from '../types';

// L'interface Request est déjà étendue dans le fichier types/express.d.ts

/**
 * Middleware d'authentification
 * Vérifie si l'utilisateur est connecté en validant le token JWT
 */
export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Vérifier si le token est présent dans les headers
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.token) {
      // Ou dans les cookies
      token = req.cookies.token;
    }

    // Vérifier si le token existe
    if (!token) {
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource', 401));
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus', 401));
    }

    // Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
      return next(new AppError('Votre mot de passe a été modifié récemment. Veuillez vous reconnecter.', 401));
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Token invalide ou expiré', 401));
  }
});

/**
 * Middleware d'autorisation
 * Vérifie si l'utilisateur a les rôles requis pour accéder à une ressource
 * @param roles Rôles autorisés
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Vérifier si l'utilisateur a le rôle requis
    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError(`Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`, 403));
    }
    next();
  };
};
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Vous n\'avez pas la permission d\'effectuer cette action.', 403));
    }
    
    next();
  };
};
