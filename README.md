# Beyana - Alimentation Biologique

Beyana est une plateforme e-commerce spécialisée dans la vente de produits alimentaires biologiques, offrant une expérience d'achat intuitive et éco-responsable.

## À propos du projet

Beyana propose une sélection de produits alimentaires biologiques de haute qualité, avec un accent particulier sur la durabilité et la santé. Notre plateforme met en avant des produits respectueux de l'environnement et du bien-être des consommateurs.

## Technologies utilisées

Ce projet est construit avec les technologies modernes suivantes :

- **Frontend** : React 18.3+, TypeScript 5.5+
- **Backend** : Node.js, Express, MongoDB avec Mongoose
- **Build Tool** : Vite 5.4+
- **Styling** : Tailwind CSS 3.4+
- **UI Components** : shadcn/ui (basé sur Radix UI)
- **Gestion d'état** : TanStack Query 5.56+
- **Routage** : React Router DOM 6.26+
- **Formulaires** : React Hook Form 7.53+ avec validation Zod 3.23+
- **Authentification** : JWT avec refresh tokens

## Fonctionnalités principales

- Catalogue de produits avec filtrage avancé
- Pages produits avec composants nutritionnels interactifs
- Panier d'achat persistant
- Système de paiement sécurisé
- Comptes clients avec programme de fidélité
- Blog avec recettes et conseils nutritionnels
- Fonctionnalités marketing (promotions, codes de réduction)

## Installation et démarrage

### Prérequis
- Node.js (version 18+)
- npm ou yarn

### Installation

```bash
# Cloner le dépôt
git clone <URL_DU_REPO>

# Accéder au répertoire du projet
cd beyana-bio

# Installer les dépendances
npm install
# ou
yarn install

# Démarrer le serveur de développement
npm run dev
# ou
yarn dev
```

Le serveur de développement sera accessible à l'adresse http://localhost:8080.

## Structure du projet

```
beyana-bio/
├── public/           # Ressources statiques
├── src/              # Code source
│   ├── components/   # Composants réutilisables
│   ├── hooks/        # Hooks personnalisés
│   ├── lib/          # Utilitaires et fonctions
│   ├── pages/        # Pages de l'application
│   ├── App.tsx       # Composant racine
│   └── main.tsx      # Point d'entrée
├── index.html        # Template HTML
└── package.json      # Dépendances et scripts
```

## Déploiement

Pour déployer l'application en production :

```bash
# Construire l'application pour la production
npm run build
# ou
yarn build

# Prévisualiser la version de production localement
npm run preview
# ou
yarn preview
```

Les fichiers de production seront générés dans le dossier `dist/`.

## Documentation des composants UI

Le projet utilise une bibliothèque de composants UI basée sur shadcn/ui et Radix UI. Pour faciliter le développement et éviter les erreurs de typage, une documentation détaillée des propriétés requises pour chaque composant est disponible dans le fichier `feuilleDeRoute.md`.

### Points importants à noter

- Certains composants comme `ToggleGroup` et `ToggleGroupItem` nécessitent des propriétés spécifiques (`type` et `value` respectivement)
- Les imports et exports des composants ont été optimisés pour éviter les erreurs TypeScript
- Les fichiers de configuration comme `tailwind.config.ts` utilisent désormais la syntaxe d'importation ES6 au lieu de `require()`

## Récentes améliorations

### Corrections TypeScript

- Résolution des erreurs TypeScript dans les contrôleurs backend
- Amélioration du typage des requêtes Express avec une interface `RequestBody` détaillée
- Correction des problèmes d'exportation dans les composants UI
- Remplacement de `@ts-ignore` par `@ts-expect-error` avec des commentaires explicatifs
- Modernisation des importations dans les fichiers de configuration

### Optimisations de code

- Meilleure gestion des types pour les middlewares d'authentification
- Validation améliorée pour les enums comme `OrderStatus`
- Conversion appropriée des identifiants MongoDB en `ObjectId`

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

Pour contribuer au projet, veuillez suivre ces directives :

1. Consultez la documentation des composants avant de modifier les fichiers UI
2. Respectez les conventions de typage TypeScript établies
3. Testez vos modifications avant de soumettre une pull request

## Licence

Ce projet est sous licence [MIT](LICENSE).
