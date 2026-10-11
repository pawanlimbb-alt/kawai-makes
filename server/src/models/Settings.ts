import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  shippingFee: number;
  codCity: string;
  ownerEmail: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    shippingFee: { type: Number, default: 60 },
    codCity: { type: String, default: 'dibrugarh', lowercase: true, trim: true },
    ownerEmail: { type: String, default: 'owner@kawaimakes.com', lowercase: true, trim: true }
  },
  {
    timestamps: true
  }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

export async function getShopSettings(): Promise<ISettings> {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      shippingFee: 60,
      codCity: 'dibrugarh',
      ownerEmail: process.env.OWNER_EMAIL || 'owner@kawaimakes.com'
    });
  }
  return settings;
}
