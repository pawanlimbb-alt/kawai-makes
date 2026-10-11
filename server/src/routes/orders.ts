import { Router, Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { Order, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { getShopSettings } from '../models/Settings';
import { config } from '../config';
import { getRazorpayInstance } from '../utils/razorpay';

export const ordersRouter = Router();

// Rate limiter for order placement: 15 per 15 minutes per IP
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order requests. Please wait a moment and try again.' }
});

// Generate clean human-readable Order ID e.g. KM-4F2A9
function generateOrderId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KM-${randomPart}`;
}

const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Full name is required').max(100),
    phone: z.string().min(10, 'Valid 10-digit phone number is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().min(5, 'Complete address is required').max(500),
    city: z.string().min(2, 'City is required').max(100),
    pin: z.string().min(6, '6-digit PIN code is required')
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1).max(100),
        options: z.string().max(300).optional(),
        note: z.string().max(500).optional()
      })
    )
    .min(1, 'Your bag is empty')
    .max(50, 'Cannot order more than 50 items at once'),
  paymentMethod: z.enum(['ONLINE', 'COD'])
});

// POST /api/orders - Create a new order
ordersRouter.post('/orders', orderLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = CreateOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { customer, items, paymentMethod } = parseResult.data;

    // 1. Sanitize & Normalize Customer Details
    const name = customer.name.trim();
    const rawPhone = customer.phone.replace(/\D/g, '');
    const phone = rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;
    const email = customer.email ? customer.email.toLowerCase().trim() : undefined;
    const address = customer.address.trim();
    const city = customer.city.trim();
    const pin = customer.pin.replace(/\D/g, '');

    if (phone.length !== 10) {
      res.status(400).json({ error: 'Please enter a valid 10-digit Indian phone number.' });
      return;
    }

    if (pin.length !== 6) {
      res.status(400).json({ error: 'Please enter a valid 6-digit PIN code.' });
      return;
    }

    // 2. Validate Shop Settings & COD Eligibility
    const settings = await getShopSettings();

    if (paymentMethod === 'COD') {
      const isCodEligible = city.toLowerCase().includes(settings.codCity.toLowerCase());
      if (!isCodEligible) {
        res.status(400).json({
          error: `Cash on Delivery is only available for ${settings.codCity}. Please select Online Payment.`
        });
        return;
      }
    }

    // 3. Server-Side Price Verification (Never trust prices sent from client)
    let subtotal = 0;
    let hasCustomItems = false;
    const sanitizedItems: IOrderItem[] = [];

    // Collect product slugs / IDs to query catalog in one batch
    const regularProductIds = items.filter((i) => i.productId !== 'custom').map((i) => i.productId);

    const validProducts = await Product.find({
      $or: [
        { slug: { $in: regularProductIds } },
        { _id: { $in: regularProductIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) } }
      ]
    });

    const productMap = new Map();
    validProducts.forEach((p) => {
      if (p.slug) productMap.set(p.slug, p);
      productMap.set(p._id.toString(), p);
    });

    for (const item of items) {
      if (item.productId === 'custom' || item.productId.startsWith('custom')) {
        hasCustomItems = true;
        sanitizedItems.push({
          productId: 'custom',
          name: 'Custom piece',
          qty: item.qty,
          unitPrice: null,
          options: item.options || 'Custom request',
          note: item.note
        });
        continue;
      }

      const product = productMap.get(item.productId);
      if (!product) {
        res.status(404).json({ error: `Product '${item.productId}' not found in catalog.` });
        return;
      }

      if (!product.active) {
        res.status(400).json({ error: `Product '${product.name}' is currently unavailable.` });
        return;
      }

      const unitPrice = typeof product.price === 'number' ? product.price : 0;
      subtotal += unitPrice * item.qty;

      sanitizedItems.push({
        product: product._id,
        productId: product.slug || product._id.toString(),
        name: product.name,
        qty: item.qty,
        unitPrice,
        options: item.options,
        note: item.note
      });
    }

    const shipping = sanitizedItems.length > 0 ? settings.shippingFee : 0;
    const total = subtotal + shipping;

    const quoteStatus = hasCustomItems ? 'pending' : 'none';
    let paymentStatus: 'unpaid' | 'cod_pending' = paymentMethod === 'COD' ? 'cod_pending' : 'unpaid';

    // 4. Unique Order ID Generation
    let orderId = generateOrderId();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existing = await Order.findOne({ orderId });
      if (!existing) {
        isUnique = true;
      } else {
        orderId = generateOrderId();
        attempts++;
      }
    }

    // 5. Razorpay Order Creation (if online & ready-made & in razorpay mode)
    let razorpayOrderId: string | undefined = undefined;
    const razorpay = getRazorpayInstance();

    if (paymentMethod === 'ONLINE' && !hasCustomItems && total > 0 && config.paymentMode === 'razorpay') {
      if (razorpay) {
        try {
          const rzpOrder = await razorpay.orders.create({
            amount: total * 100, // paise
            currency: 'INR',
            receipt: orderId,
            notes: {
              orderId,
              customerName: name
            }
          });
          razorpayOrderId = rzpOrder.id;
        } catch (rzpErr) {
          console.error('Razorpay order creation error:', rzpErr);
          // Allow manual_upi or fallback if Razorpay fails
        }
      }
    }

    // 6. Save Order in MongoDB
    const newOrder = await Order.create({
      orderId,
      user: req.user?._id,
      customer: {
        name,
        phone,
        email,
        address,
        city,
        pin
      },
      items: sanitizedItems,
      subtotal,
      shipping,
      total,
      hasCustomItems,
      quoteStatus,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      status: 'new'
    });

    // Auto-save address to logged-in user profile if not already present
    if (req.user) {
      const addressExists = req.user.savedAddresses.some(
        (a) => a.address === address && a.city.toLowerCase() === city.toLowerCase() && a.pin === pin
      );
      if (!addressExists) {
        req.user.savedAddresses.push({ label: 'Home', address, city, pin });
        if (!req.user.phone) req.user.phone = phone;
        await req.user.save();
      }
    }

    // Safe Server Logging (No PII)
    console.log(`[Order Placed] ID=${orderId} Method=${paymentMethod} Status=${paymentStatus} Total=INR ${total}`);

    res.status(201).json({
      success: true,
      orderId: newOrder.orderId,
      subtotal: newOrder.subtotal,
      shipping: newOrder.shipping,
      total: newOrder.total,
      hasCustomItems: newOrder.hasCustomItems,
      quoteStatus: newOrder.quoteStatus,
      paymentMethod: newOrder.paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      status: newOrder.status,
      // Razorpay checkout payload
      razorpayOrderId,
      amount: total * 100,
      keyId: config.razorpayKeyId,
      paymentMode: config.paymentMode,
      upiId: config.upiId
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to process order. Please try again.' });
  }
});
