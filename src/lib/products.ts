import connectDB from "./db";
import ProductModel from "@/models/Product";

export type ProductDetails = {
  description: string;
  fabricDetails: string;
  careInstructions: string;
  craftsmanshipDetails: string;
  craftingTime: string;
  estimatedDeliveryTime: string;
};

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  image: string;
  gallery: string[];
  soldOut: boolean;
  stock: number;
  isNew: boolean;
  sizes?: string[];
  details: ProductDetails;
  isBestseller?: boolean;
  isFeatured?: boolean;
};

const defaultDetails: ProductDetails = {
  description: "A stunning handcrafted piece by Kriva Studio, designed to bring elegance and traditional artistry to your wardrobe or home.",
  fabricDetails: "Premium quality fabric/material sourced for durability and aesthetic appeal.",
  careInstructions: "Dry clean only. Do not iron directly on the painted motifs.",
  craftsmanshipDetails: "Meticulously hand-painted by skilled artisans using traditional techniques.",
  craftingTime: "10-15 Days",
  estimatedDeliveryTime: "3-5 Business Days",
};

// Helper to map MongoDB document to frontend Product type
function mapMongoToProduct(p: any): Product {
  const isClothing = ["sarees", "mens-wear", "lehengas", "suit-sets", "kids-wear"].includes(p.category.toLowerCase().replace(/\s+/g, '-'));
  
  // Calculate original price based on discount
  let originalPrice = null;
  if (p.discount && p.discount > 0) {
    originalPrice = Math.round(p.price / (1 - p.discount / 100));
  }

  // Ensure there's at least one image
  const mainImage = p.images && p.images.length > 0 ? p.images[0] : "/images/placeholder.png";
  const gallery = p.images && p.images.length > 0 ? p.images : [mainImage, mainImage];

  return {
    id: p._id.toString(), // or p.id if it's stored
    title: p.name,
    subtitle: p.description || p.category,
    category: p.category,
    categorySlug: p.category.toLowerCase().replace(/\s+/g, '-'),
    price: p.price,
    originalPrice,
    rating: 5.0, // Static for now
    image: mainImage,
    gallery,
    soldOut: p.stock <= 0,
    stock: p.stock,
    isNew: p.isNewArrival || false,
    isBestseller: p.isBestseller || false,
    isFeatured: p.isFeatured || false,
    sizes: isClothing ? ["S", "M", "L", "XL", "XXL"] : undefined,
    details: {
      ...defaultDetails,
      description: p.description || defaultDetails.description
    }
  };
}

export async function getAllProducts(): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({ status: 'Active' }).lean();
  return products.map(mapMongoToProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await connectDB();
  // id could be MongoDB _id or string id field. Let's try both or just findById if it's a valid ObjectId
  let product;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await ProductModel.findById(id).lean();
  } else {
    product = await ProductModel.findOne({ id }).lean();
  }
  
  if (!product) return undefined;
  return mapMongoToProduct(product);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({ status: 'Active' }).lean();
  return products.map(mapMongoToProduct).filter(p => p.categorySlug === slug);
}

export async function getRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({ status: 'Active', category: product.category }).lean();
  return products
    .map(mapMongoToProduct)
    .filter(p => p.id !== product.id)
    .slice(0, limit);
}

export async function getBestsellers(limit: number = 4): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({ status: 'Active', isBestseller: true })
    .limit(limit)
    .lean();
  return products.map(mapMongoToProduct);
}

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({ status: 'Active', isFeatured: true })
    .limit(limit)
    .lean();
  return products.map(mapMongoToProduct);
}

export async function getNewArrivals(limit: number = 4): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({ status: 'Active', isNewArrival: true })
    .limit(limit)
    .lean();
  return products.map(mapMongoToProduct);
}
