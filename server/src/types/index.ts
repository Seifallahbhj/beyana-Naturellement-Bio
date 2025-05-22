import { SortOrder } from 'mongoose';

// Types pour les requêtes
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CategoryQuery extends QueryOptions {
  name?: string;
  slug?: string;
  level?: number;
  parent?: string | null;
  active?: boolean;
}

export interface OrderQuery extends QueryOptions {
  user?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  paymentStatus?: string;
  orderNumber?: string;
  createdAt?: { $gte?: Date; $lte?: Date };
}

export interface ReviewQuery extends QueryOptions {
  product?: string;
  user?: string;
  rating?: number;
  isApproved?: boolean;
  verifiedPurchase?: boolean;
}

// Types pour JWT
export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

import { Document } from 'mongoose';

// Type pour les utilisateurs dans les réponses
export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  password?: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  loyaltyPoints: number;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phoneNumber?: string;
  passwordChangedAfter?: (timestamp: number) => boolean;
  createPasswordResetToken?: () => string;
}
