import mongoose, { Schema, Document } from 'mongoose';

// Interface pour le document Category
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  level: number;
  isActive: boolean;
}

// Interface pour les méthodes statiques du modèle Category
interface CategoryModel extends mongoose.Model<ICategory> {
  getSubcategories(categoryId: mongoose.Types.ObjectId): Promise<ICategory[]>;
  getCategoryPath(categoryId: mongoose.Types.ObjectId): Promise<Array<{_id: mongoose.Types.ObjectId; name: string; slug: string;}>>;
}

// Schéma catégorie
const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true,
    maxlength: [50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  level: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware pour définir automatiquement le niveau de la catégorie en fonction de son parent
categorySchema.pre<ICategory>('save', async function(next) {
  if (this.parent) {
    try {
      const parentCategory = await mongoose.model('Category').findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
      }
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  } else {
    this.level = 1;
  }
  next();
});

// Méthode statique pour obtenir les sous-catégories d'une catégorie
categorySchema.statics.getSubcategories = async function(categoryId) {
  return this.find({ parent: categoryId });
};

// Méthode statique pour obtenir le chemin complet d'une catégorie (pour les fils d'Ariane)
categorySchema.statics.getCategoryPath = async function(categoryId) {
  interface CategoryPathItem {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  }
  
  const path: CategoryPathItem[] = [];
  let currentCategory = await this.findById(categoryId);
  
  if (!currentCategory) return path;
  
  path.unshift({
    _id: currentCategory._id,
    name: currentCategory.name,
    slug: currentCategory.slug
  });
  
  while (currentCategory.parent) {
    currentCategory = await this.findById(currentCategory.parent);
    if (currentCategory) {
      path.unshift({
        _id: currentCategory._id,
        name: currentCategory.name,
        slug: currentCategory.slug
      });
    } else {
      break;
    }
  }
  
  return path;
};

const Category = mongoose.model<ICategory, CategoryModel>('Category', categorySchema);

export default Category;
