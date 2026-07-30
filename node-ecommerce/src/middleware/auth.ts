import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import * as authService from '../services/auth.service';
import { AppError } from './error-handler';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Autenticación requerida');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new AppError(401, 'Autenticación requerida');
    }

    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    if (!req.user) {
      throw new AppError(401, 'Autenticación requerida');
    }
    if (req.user.role !== UserRole.admin) {
      throw new AppError(403, 'Acceso solo para administradores');
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Autenticación + rol admin en un solo paso */
export const adminOnly = [authenticate, requireAdmin];
