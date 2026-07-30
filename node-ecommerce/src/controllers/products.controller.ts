import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { getParam } from '../utils/params';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await productService.listProducts(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await productService.getProductById(getParam(req.params.id));
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await productService.updateProduct(
      getParam(req.params.id),
      req.body,
    );
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await productService.deleteProduct(getParam(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
