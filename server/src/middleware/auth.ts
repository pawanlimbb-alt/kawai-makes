import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, setAuthCookies } from '../utils/token';
import { User, IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const accessToken = req.cookies?.km_access || req.headers.authorization?.replace('Bearer ', '');
    const refreshToken = req.cookies?.km_refresh;

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        const user = await User.findById(payload.userId);
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

    // Try silent refresh if refresh token is present
    if (refreshToken) {
      const refreshPayload = verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        const user = await User.findById(refreshPayload.userId);
        if (user) {
          req.user = user;
          // Refresh the cookies
          setAuthCookies(res, user);
          return next();
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access forbidden. Admin privileges required.' });
    return;
  }

  next();
}
