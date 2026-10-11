import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number | null;
  options?: string;
  note?: string;
}

export interface ICustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pin: string;
}

export type QuoteStatus = 'none' | 'pending' | 'quoted' | 'accepted';
export type PaymentMethod = 'ONLINE' | 'COD';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'cod_pending' | 'cod_collected';
export type OrderStatus = 'new' | 'confirmed' | 'making' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrder extends Document {
  orderId: string;
  user?: mongoose.Types.ObjectId;
  customer: ICustomerDetails;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  hasCustomItems: boolean;
  quoteStatus: QuoteStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
  status: OrderStatus;
  trackingNote?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, default: null },
    options: { type: String },
    note: { type: String }
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomerDetails>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pin: { type: String, required: true }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer: { type: CustomerSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    hasCustomItems: { type: Boolean, default: false },
    quoteStatus: {
      type: String,
      enum: ['none', 'pending', 'quoted', 'accepted'],
      default: 'none'
    },
    paymentMethod: {
      type: String,
      enum: ['ONLINE', 'COD'],
      default: 'ONLINE'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'cod_pending', 'cod_collected'],
      default: 'unpaid',
      index: true
    },
    razorpayOrderId: { type: String, sparse: true, index: true },
    razorpayPaymentId: { type: String, sparse: true },
    paymentLinkId: { type: String, sparse: true },
    paymentLinkUrl: { type: String },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'making', 'shipped', 'delivered', 'cancelled'],
      default: 'new',
      index: true
    },
    trackingNote: { type: String, default: '' },
    adminNotes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
