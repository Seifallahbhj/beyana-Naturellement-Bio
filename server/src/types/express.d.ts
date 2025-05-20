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
  export type NextFunction = (err?: any) => void;

  export interface Request extends core.Request {
    user?: Express.Request['user'];
    body: any;
    params: any;
    query: any;
    headers: any;
    cookies: any;
    originalUrl: string;
  }

  export interface Response extends core.Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
    cookie(name: string, value: any, options?: any): this;
  }

  export interface Express extends core.Express {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    patch: any;
    listen: any;
  }

  export interface Router {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    patch: any;
    all: any;
    route: any;
    param: any;
  }

  // Définition du namespace pour l'export par défaut
  interface ExpressModule {
    (): Express;
    Router(options?: any): Router;
    json(options?: any): any;
    urlencoded(options?: any): any;
    static(root: string, options?: any): any;
  }

  // Export par défaut
  const express: ExpressModule;
  export default express;
}
