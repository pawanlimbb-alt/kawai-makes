import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit';
import { User, IUser } from '../models/User';
import { config } from '../config';
import { setAuthCookies, clearAuthCookies, verifyRefreshToken } from '../utils/token';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

// Rate limiter for auth endpoints: 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const googleClient = new OAuth2Client(config.googleClientId);

function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    phone: user.phone || '',
    savedAddresses: user.savedAddresses || [],
    createdAt: user.createdAt
  };
}

function checkAdminRole(email: string): 'admin' | 'customer' {
  return config.adminEmails.includes(email.toLowerCase().trim()) ? 'admin' : 'customer';
}

// Zod Schemas
const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const GoogleAuthSchema = z.object({
  credential: z.string().min(10, 'Google ID token credential is required')
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Valid reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
});

// POST /api/auth/register
authRouter.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { name, email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.passwordHash) {
        res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
        return;
      }
      // If user signed in with Google before, attach password
      existingUser.passwordHash = await bcrypt.hash(password, 12);
      existingUser.role = checkAdminRole(normalizedEmail);
      await existingUser.save();

      setAuthCookies(res, existingUser);
      res.status(200).json({ success: true, user: sanitizeUser(existingUser) });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = checkAdminRole(normalizedEmail);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      emailVerified: false
    });

    setAuthCookies(res, user);
    res.status(201).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Incorrect email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Incorrect email or password' });
      return;
    }

    // Auto-update admin role if email is in ADMIN_EMAILS
    const expectedRole = checkAdminRole(normalizedEmail);
    if (user.role !== expectedRole) {
      user.role = expectedRole;
      await user.save();
    }

    setAuthCookies(res, user);
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/google
authRouter.post('/google', authLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = GoogleAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { credential } = parseResult.data;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId || undefined
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.email_verified) {
      res.status(400).json({ error: 'Google authentication failed or email is unverified.' });
      return;
    }

    const googleEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const googleName = payload.name || payload.given_name || 'Customer';

    let user = await User.findOne({ email: googleEmail });

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.emailVerified = true;
      user.role = checkAdminRole(googleEmail);
      await user.save();
    } else {
      // Create new user from Google profile
      user = await User.create({
        name: googleName,
        email: googleEmail,
        googleId,
        role: checkAdminRole(googleEmail),
        emailVerified: true
      });
    }

    setAuthCookies(res, user);
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ error: 'Invalid Google authentication token.' });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.km_refresh;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token missing.' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      clearAuthCookies(res);
      res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      clearAuthCookies(res);
      res.status(401).json({ error: 'User no longer exists.' });
      return;
    }

    setAuthCookies(res, user);
    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Session refresh failed.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user!) });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = ForgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email } = parseResult.data;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordTokenHash = resetTokenHash;
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();

      const resetUrl = `${config.appUrl}/reset-password?token=${resetToken}`;
      console.log(`[Password Reset] Link generated for ${user.email}: ${resetUrl}`);
      // Resend / Email delivery will be hooked in notification step
    }

    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      message: 'If this email is registered, password reset instructions have been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Could not process password reset request.' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = ResetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { token, password } = parseResult.data;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ error: 'Password reset link is invalid or has expired.' });
      return;
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    setAuthCookies(res, user);
    res.status(200).json({ success: true, message: 'Password has been reset successfully.', user: sanitizeUser(user) });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});
