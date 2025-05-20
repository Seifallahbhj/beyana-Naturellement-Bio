# Beyana - Alimentation Biologique

Beyana est une plateforme e-commerce spécialisée dans la vente de produits alimentaires biologiques, offrant une expérience d'achat intuitive et éco-responsable.

## À propos du projet

Beyana propose une sélection de produits alimentaires biologiques de haute qualité, avec un accent particulier sur la durabilité et la santé. Notre plateforme met en avant des produits respectueux de l'environnement et du bien-être des consommateurs.

## Technologies utilisées

Ce projet est construit avec les technologies modernes suivantes :

- **Frontend** : React 18.3+, TypeScript 5.5+
- **Build Tool** : Vite 5.4+
- **Styling** : Tailwind CSS 3.4+
- **UI Components** : shadcn/ui (basé sur Radix UI)
- **Gestion d'état** : TanStack Query 5.56+
- **Routage** : React Router DOM 6.26+
- **Formulaires** : React Hook Form 7.53+ avec validation Zod 3.23+

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

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence [MIT](LICENSE).
