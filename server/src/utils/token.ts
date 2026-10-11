import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config';
import { IUser } from '../models/User';

export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

export const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes in ms
export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export function generateAccessToken(user: IUser): string {
  const payload: ITokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(user: IUser): string {
  const payload: ITokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): ITokenPayload | null {
  try {
    return jwt.verify(token, config.jwtAccessSecret) as ITokenPayload;
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string): ITokenPayload | null {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as ITokenPayload;
  } catch (err) {
    return null;
  }
}

export function setAuthCookies(res: Response, user: IUser): void {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax' as const,
    path: '/'
  };

  res.cookie('km_access', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  res.cookie('km_refresh', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE
  });
}

export function clearAuthCookies(res: Response): void {
  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax' as const,
    path: '/'
  };

  res.clearCookie('km_access', cookieOptions);
  res.clearCookie('km_refresh', cookieOptions);
}
