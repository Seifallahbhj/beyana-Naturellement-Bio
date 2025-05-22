import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Interface pour le document User
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phoneNumber?: string;
  loyaltyPoints: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
  passwordChangedAfter?(timestamp: number): boolean;
}

// Enum pour les rôles utilisateur
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

// Schéma pour l'adresse
const addressSchema = new Schema({
  street: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    default: 'France'
  }
}, { _id: false });

// Schéma utilisateur
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // Ne pas inclure par défaut dans les requêtes
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  address: addressSchema,
  phoneNumber: {
    type: String,
    trim: true
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Middleware pre-save pour hacher le mot de passe
userSchema.pre<IUser>('save', async function(next) {
  // Seulement hacher le mot de passe s'il a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    // Générer un salt
    const salt = await bcrypt.genSalt(10);
    // Hacher le mot de passe avec le salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier si le mot de passe a été changé après l'émission du token
userSchema.methods.passwordChangedAfter = function(timestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    return timestamp < changedTimestamp;
  }
  return false;
};

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
