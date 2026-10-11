import Razorpay from 'razorpay';
import { config } from '../config';

let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay | null {
  if (razorpayInstance) return razorpayInstance;

  if (config.razorpayKeyId && config.razorpayKeySecret) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
    return razorpayInstance;
  }

  return null;
}
