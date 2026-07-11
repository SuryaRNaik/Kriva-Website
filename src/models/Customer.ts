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
  role?: string;
  
  // Security Fields
  emailVerified?: boolean;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  failedLoginAttempts?: number;
  lockUntil?: Date;

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
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    
    // Security Fields
    emailVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpiry: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
