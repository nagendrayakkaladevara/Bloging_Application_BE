import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { config } from '../config/env';

export function requireAdminApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return next(new AppError(
      'UNAUTHORIZED',
      'API key is required for this operation',
      401
    ));
  }

  if (apiKey !== config.adminApiKey) {
    return next(new AppError(
      'UNAUTHORIZED',
      'Invalid API key',
      401
    ));
  }

  next();
}
