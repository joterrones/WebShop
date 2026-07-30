import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import * as productService from '../services/product.service';
import { getParam } from '../utils/params';

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await categoryService.listCategoriesTree();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getProductsBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await productService.getProductsByCategorySlug(
      getParam(req.params.slug),
      req.query,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
