import { Router, Request, Response } from 'express';

export const healthRouter = Router();

// Fast health check endpoint (does not touch database)
healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, timestamp: Date.now() });
});
