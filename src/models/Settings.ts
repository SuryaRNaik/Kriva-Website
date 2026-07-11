import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  cancellationWindowHours: number;
  defaultProductionDays: number;
  defaultDeliveryDays: number;
  lowStockThreshold: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSenderName: string;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    storeName: { type: String, default: "Kriva Studio" },
    storeEmail: { type: String, default: "support@krivastudio.in" },
    storePhone: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    cancellationWindowHours: { type: Number, default: 24 },
    defaultProductionDays: { type: Number, default: 5 },
    defaultDeliveryDays: { type: Number, default: 7 },
    lowStockThreshold: { type: Number, default: 5 },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    smtpSenderName: { type: String, default: "Kriva Studio" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
