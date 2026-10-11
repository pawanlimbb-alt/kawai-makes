import dns from 'node:dns';



import mongoose from 'mongoose';
import { config } from './index';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDB(): Promise<void> {
  try {
    if (!config.mongodbUri) {
      console.warn('⚠️ MONGODB_URI is not set. Database connection skipped.');
      return;
    }

    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't crash the server immediately so health check still functions
  }
}
