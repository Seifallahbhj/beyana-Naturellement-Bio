import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import connectDB from './config/database';
import routes from './routes';
import { errorHandler, AppError } from './middlewares/errorHandler';

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Créer l'application Express
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet()); // Sécurité HTTP
app.use(compression()); // Compression des réponses
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les uploads d'images
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Pour gérer les cookies

// Servir les fichiers statiques (pour la production)
if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques du build de production
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  // Gérer le routage côté client pour toutes les autres requêtes
  app.get('*', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../../dist/index.html');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res as any).sendFile(filePath, (err: Error) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du fichier:', err);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res as any).status(500).send('Erreur lors du chargement de l\'application');
      }
    });
  });
}

// Routes API
app.use(routes);

// Route de base
app.get('/', (req: Request, res: Response) => {
  res.send('Beyana API is running...');
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Gestion des routes non trouvées
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.originalUrl}`
  });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err: Error) => {
  console.error(`Erreur non gérée: ${err.message}`);
  console.error(err.stack);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
