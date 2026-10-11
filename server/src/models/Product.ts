import mongoose, { Document, Schema } from 'mongoose';

export interface IProductOption {
  label: string;
  choices: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: 'Bouquets' | 'Keychains' | 'Phone charms' | string;
  material: string;
  price: number;
  description: string;
  options: IProductOption[];
  imageUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductOptionSchema = new Schema<IProductOption>(
  {
    label: { type: String, required: true },
    choices: [{ type: String, required: true }]
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['Bouquets', 'Keychains', 'Phone charms', 'Other'],
      default: 'Keychains'
    },
    material: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    options: [ProductOptionSchema],
    imageUrl: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
