import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User, { UserRole } from '../models/user.model';
import { AppError, catchAsync } from '../middlewares/errorHandler';
import { JwtPayload, IUserDocument } from '../types';
import { Document } from 'mongoose';

// Fonction pour générer un token JWT
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'secret-dev-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  return jwt.sign(
    { id },
    secret,
    { expiresIn }
  );
};

// Fonction pour générer un refresh token
const generateRefreshToken = (id: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev-key';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { id },
    secret,
    { expiresIn }
  );
};

// Type pour les utilisateurs dans la réponse
interface UserWithPassword {
  _id: string;
  password?: string | undefined;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

type UserResponseType = IUserDocument | (Document & UserWithPassword);

// Fonction pour envoyer les tokens dans la réponse
const sendTokenResponse = (user: UserResponseType, statusCode: number, res: Response) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Options pour le cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // Envoyer le cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Supprimer le mot de passe de la sortie
  const userObj = user as UserWithPassword;
  if (userObj.password !== undefined) {
    userObj.password = undefined;
  }

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/v1/auth/register
// @access  Public
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Cet email est déjà utilisé', 400));
  }

  // Créer un nouvel utilisateur
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: UserRole.USER
  });

  // Générer un token de vérification
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  await user.save({ validateBeforeSave: false });

  // TODO: Envoyer un email de vérification
  // sendVerificationEmail(user.email, verificationToken);

  sendTokenResponse(user, 201, res);
});

// @desc    Connexion d'un utilisateur
// @route   POST /api/v1/auth/login
// @access  Public
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Vérifier si l'email et le mot de passe sont fournis
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }

  // Vérifier si le mot de passe est correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Déconnexion d'un utilisateur
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @desc    Vérification de l'email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken
  });

  if (!user) {
    return next(new AppError('Token invalide ou expiré', 400));
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email vérifié avec succès'
  });
});

// @desc    Demande de réinitialisation du mot de passe
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save({ validateBeforeSave: false });

  // TODO: Envoyer un email de réinitialisation
  // sendPasswordResetEmail(user.email, resetToken);

  res.status(200).json({
    success: true,
    message: 'Email de réinitialisation envoyé'
  });
});

// @desc    Réinitialisation du mot de passe
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token invalide ou expiré', 400));
  }

  // Définir le nouveau mot de passe
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/v1/auth/profile
// @access  Private
export const getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, address, phoneNumber } = req.body;

  // Vérifier si l'email est déjà utilisé
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Cet email est déjà utilisé', 400));
    }
  }

  // Mettre à jour le profil
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, email, address, phoneNumber },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/v1/auth/update-password
// @access  Private
export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Vérifier si le mot de passe actuel est correct
  const isMatch = await user!.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Mot de passe actuel incorrect', 401));
  }

  // Mettre à jour le mot de passe
  user!.password = newPassword;
  await user!.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Rafraîchir le token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Veuillez vous connecter', 401));
  }

  try {
    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus', 401));
    }

    // Générer un nouveau token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    return next(new AppError('Token invalide ou expiré', 401));
  }
});
