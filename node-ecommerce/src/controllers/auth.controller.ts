import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Autenticación requerida' });
      return;
    }
    const user = await authService.getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Autenticación requerida' });
      return;
    }
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
