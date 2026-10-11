import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from server directory or root directory
const envResult = dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  override: true,
});

console.log('dotenv error:', envResult.error?.message ?? 'none');
console.log('dotenv parsed MONGODB_URI:', Boolean(envResult.parsed?.MONGODB_URI));
console.log('process MONGODB_URI:', Boolean(process.env.MONGODB_URI));

const envPath = path.resolve(__dirname, '../../../.env');

console.log('Config directory:', __dirname);
console.log('Expected .env path:', envPath);
console.log('Does .env exist there?', fs.existsSync(envPath));
console.log('MONGODB_URI loaded?', Boolean(process.env.MONGODB_URI));


export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kawaimakes',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'kawai_makes_jwt_access_secret_change_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'kawai_makes_jwt_refresh_secret_change_in_production',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),
  paymentMode: (process.env.PAYMENT_MODE === 'manual_upi' ? 'manual_upi' : 'razorpay') as 'razorpay' | 'manual_upi',
  upiId: process.env.UPI_ID || 'kawaimakes@upi',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'kawai.makes <orders@kawaimakes.com>',
  ownerEmail: process.env.OWNER_EMAIL || 'owner@kawaimakes.com',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  cloudinaryUrl: process.env.CLOUDINARY_URL || ''

  
};
console.log(
  'MongoDB environment variable loaded:',
  Boolean(process.env.MONGODB_URI)
);

console.log(
  'MongoDB URI type:',
  config.mongodbUri.startsWith('mongodb+srv://')
    ? 'Atlas'
    : 'Local or other'
);
