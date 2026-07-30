import { Request, Response, NextFunction } from 'express';
import * as attributeService from '../services/attribute.service';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const attributes = await attributeService.listAttributes(req.query);
    res.json(attributes);
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
    const attribute = await attributeService.createAttribute(req.body);
    res.status(201).json(attribute);
  } catch (err) {
    next(err);
  }
}
