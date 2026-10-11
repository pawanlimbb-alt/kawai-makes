import express, { Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { config } from './config';
import { connectDB } from './config/db';
import { seedInitialData } from './seed/productSeed';
import { authenticateUser } from './middleware/auth';
import { healthRouter } from './routes/health';
import { productsRouter } from './routes/products';
import { authRouter } from './routes/auth';
import { ordersRouter } from './routes/orders';
import { uploadsRouter } from './routes/uploads';

const app = express();

// 1. Security & Optimisation Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Google OAuth scripts and Razorpay inline checkout
    crossOriginEmbedderPolicy: false
  })
);

app.use(compression());

if (!config.isProduction) {
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    })
  );
}

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());

// 2. Authentication Context Middleware
app.use(authenticateUser);

// 3. API Routes
app.use('/api', healthRouter);
app.use('/api', productsRouter);
app.use('/api', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api', uploadsRouter);

// 4. Static File Serving (React SPA)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// 5. SPA Fallback for React Router
app.get('*', (req: Request, res: Response) => {
  // If it's an unhandled /api route, return 404 JSON instead of HTML
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 6. Bootstrap Server
async function startServer() {
  await connectDB();
  await seedInitialData();

  app.listen(config.port, () => {
    console.log(`🚀 kawai.makes server running on port ${config.port} (${config.nodeEnv})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
