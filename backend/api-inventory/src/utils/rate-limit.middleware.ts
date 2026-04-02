import { Request, Response, NextFunction } from 'express';
import { globalLimiter, loginLimiter } from './rate-limitter';

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.headers['x-user-id'] || req.ip;

    // 🔥 stricter for login
    if (req.path.includes('/auth/login')) {
      await loginLimiter.consume(key as string);
    } else {
      await globalLimiter.consume(key as string);
    }

    next();
  } catch (err) {
    return res.status(429).json({
      message: 'Too many requests',
    });
  }
}