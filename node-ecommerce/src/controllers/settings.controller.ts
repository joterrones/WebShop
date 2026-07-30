import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';

export async function getWhatsapp(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const setting = await settingsService.getWhatsappSetting();
    res.json(setting);
  } catch (err) {
    next(err);
  }
}

export async function updateWhatsapp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const setting = await settingsService.updateWhatsappSetting(req.body);
    res.json(setting);
  } catch (err) {
    next(err);
  }
}
