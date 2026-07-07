import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  image?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    image: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
