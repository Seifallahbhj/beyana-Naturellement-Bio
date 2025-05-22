import { ObjectId } from 'mongoose';

// Augmenter les interfaces Express pour inclure les propriétés personnalisées
declare global {
  namespace Express {
    // Étendre l'interface Request pour inclure notre utilisateur personnalisé
    interface Request {
      user?: {
        _id: ObjectId;
        id?: string; // Optionnel pour éviter les erreurs de type
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isEmailVerified: boolean;
        loyaltyPoints: number;
      };
    }
  }
}

// Déclaration du module express
declare module 'express' {
  import * as http from 'http';
  import * as core from 'express-serve-static-core';

  // Définir NextFunction comme un type de fonction appelable
  export type NextFunction = (err?: Error | null | undefined) => void;

  // Interface générique pour les données de requête
  export interface RequestBody {
    // Propriétés d'authentification
    email?: string;
    password?: string;
    currentPassword?: string;
    newPassword?: string;
    
    // Propriétés utilisateur
    firstName?: string;
    lastName?: string;
    address?: string;
    phoneNumber?: string;
    
    // Propriétés de commande
    items?: Array<{product: string; quantity: number}>;
    shippingAddress?: Record<string, string>;
    paymentMethod?: string;
    status?: string;
    paymentStatus?: string;
    transactionId?: string;
    
    // Propriétés de catégorie
    name?: string;
    slug?: string;
    parent?: string;
    level?: number;
    active?: boolean;
    
    // Propriétés de produit
    description?: string;
    price?: number;
    discountPrice?: number;
    images?: string[];
    category?: string;
    stock?: number;
    featured?: boolean;
    
    // Permet d'autres propriétés non spécifiées
    [key: string]: unknown;
  }
  
  export interface Request extends core.Request {
    user?: Express.Request['user'];
    body: RequestBody;
    params: Record<string, string>;
    query: Record<string, string | string[] | number | boolean | undefined>;
    headers: Record<string, string | string[] | undefined>;
    cookies: Record<string, string>;
    originalUrl: string;
  }

  export interface Response extends core.Response {
    status(code: number): this;
    json(body: Record<string, unknown> | unknown[] | null | undefined): this;
    send(body: string | Record<string, unknown> | unknown[] | Buffer | null | undefined): this;
    cookie(name: string, value: string | number | boolean, options?: Record<string, unknown>): this;
  }

  export interface Express extends core.Express {
    use: core.ApplicationRequestHandler<this>;
    get: core.ApplicationRequestHandler<this>;
    post: core.ApplicationRequestHandler<this>;
    put: core.ApplicationRequestHandler<this>;
    delete: core.ApplicationRequestHandler<this>;
    patch: core.ApplicationRequestHandler<this>;
    listen: (port: number, callback?: () => void) => http.Server;
  }

  export interface Router {
    use: core.RouterMethods<this>;
    get: core.RouterMethods<this>;
    post: core.RouterMethods<this>;
    put: core.RouterMethods<this>;
    delete: core.RouterMethods<this>;
    patch: core.RouterMethods<this>;
    all: core.RouterMethods<this>;
    route: (path: string) => core.IRoute;
    param: (name: string, handler: core.RequestParamHandler) => this;
  }

  // Définition du namespace pour l'export par défaut
  interface ExpressModule {
    (): Express;
    Router(options?: Record<string, unknown>): Router;
    json(options?: Record<string, unknown>): core.RequestHandler;
    urlencoded(options?: { extended?: boolean; limit?: string | number; parameterLimit?: number }): core.RequestHandler;
    static(root: string, options?: Record<string, unknown>): core.RequestHandler;
  }

  // Export par défaut
  const express: ExpressModule;
  export default express;
}
