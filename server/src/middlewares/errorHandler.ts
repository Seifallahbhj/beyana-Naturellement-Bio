import { Request, Response, NextFunction } from 'express';

// Interface pour les erreurs personnalisées
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de gestion des erreurs
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Erreur par défaut
  let statusCode = 500;
  let message = 'Erreur serveur';
  let errors: any = {};

  // Si c'est une erreur personnalisée
  if ('statusCode' in err) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError' && err instanceof Error) {
    statusCode = 400;
    message = 'Erreur de validation';
    const validationErrors = err as any;
    
    if (validationErrors.errors) {
      Object.keys(validationErrors.errors).forEach(key => {
        errors[key] = validationErrors.errors[key].message;
      });
    }
  }

  // Erreur de duplication MongoDB
  if ((err as any).code === 11000) {
    statusCode = 400;
    message = 'Erreur de duplication';
    const duplicateError = err as any;
    
    if (duplicateError.keyValue) {
      const field = Object.keys(duplicateError.keyValue)[0];
      errors[field] = `La valeur '${duplicateError.keyValue[field]}' est déjà utilisée`;
    }
  }

  // Erreur de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Ressource non trouvée';
    const castError = err as any;
    errors.field = castError.path;
    errors.value = castError.value;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide. Veuillez vous reconnecter.';
  }

  // Erreur d'expiration JWT
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  // Réponse avec les détails de l'erreur
  res.status(statusCode).json({
    success: false,
    message,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware pour capturer les erreurs asynchrones
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
