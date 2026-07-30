import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { getParam } from '../utils/params';

function sessionFrom(req: Request): string {
  const header = req.header('x-cart-session');
  const query = typeof req.query.sessionToken === 'string'
    ? req.query.sessionToken
    : '';
  const body =
    req.body && typeof req.body.sessionToken === 'string'
      ? req.body.sessionToken
      : '';
  return (header || query || body || '').trim();
}

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cart = await cartService.getCart(sessionFrom(req));
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function addItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cart = await cartService.addCartItem(sessionFrom(req), req.body);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cart = await cartService.updateCartItem(
      sessionFrom(req),
      getParam(req.params.itemId),
      req.body,
    );
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cart = await cartService.removeCartItem(
      sessionFrom(req),
      getParam(req.params.itemId),
    );
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function clear(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cart = await cartService.clearCart(sessionFrom(req));
    res.json(cart);
  } catch (err) {
    next(err);
  }
}
