import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  lowStockLimit?: number;
  images: string[];
  description: string;
  shortDescription?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  material?: string;
  occasion?: string;
  careInstructions?: string;
  status?: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  slug?: string;
  isTrashed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sku: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 10 },
    lowStockLimit: { type: Number, default: 5 },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    category: { type: String, required: true },
    subCategory: { type: String },
    brand: { type: String },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    material: { type: String },
    occasion: { type: String },
    careInstructions: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'Out of Stock'], default: 'Active' },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    slug: { type: String },
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
