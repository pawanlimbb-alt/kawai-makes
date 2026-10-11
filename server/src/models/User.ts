import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedAddress {
  label?: string;
  address: string;
  city: string;
  pin: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  phone?: string;
  savedAddresses: ISavedAddress[];
  resetPasswordTokenHash?: string;
  resetPasswordExpires?: Date;
  emailVerificationTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedAddressSchema = new Schema<ISavedAddress>(
  {
    label: { type: String, default: 'Home' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pin: { type: String, required: true }
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, index: true },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, trim: true },
    savedAddresses: [SavedAddressSchema],
    resetPasswordTokenHash: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationTokenHash: { type: String }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
