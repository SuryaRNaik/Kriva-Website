import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  category: string;
  sizes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 10 },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    sizes: { type: [String], default: undefined },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
