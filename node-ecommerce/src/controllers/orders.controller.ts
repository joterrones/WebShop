import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { getParam } from '../utils/params';

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await orderService.listOrders(req.query);
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
    const order = await orderService.getOrderById(getParam(req.params.id));
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await orderService.updateOrderStatus(
      getParam(req.params.id),
      req.body,
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function applyAdjustment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await orderService.applyOrderAdjustment(
      getParam(req.params.id),
      req.body,
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
}
