import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

const seedProducts = [
  {
    id: "tanjore-ganesha",
    name: "Divine Ganesha Tanjore Painting",
    category: "Tanjore Painting",
    price: 6500,
    originalPrice: 7500,
    discount: 13,
    stock: 10,
    images: ["/images/tanjore_ganesha.jpg"],
    description: "Authentic Tanjore painting of Lord Ganesha with 22k gold foil.",
    shortDescription: "22k Gold Foil Ganesha",
    status: "Active",
    isFeatured: true,
    isBestseller: true,
    slug: "divine-ganesha-tanjore-painting"
  },
  {
    id: "dress-1",
    name: "Royal Blue Anarkali Suit",
    category: "Suit Sets",
    subCategory: "Suit Sets",
    price: 3500,
    originalPrice: 5000,
    discount: 30,
    stock: 15,
    images: ["/images/dress_anarkali.jpg"],
    description: "Elegant Royal Blue Anarkali suit set with intricate embroidery.",
    shortDescription: "Embroidered Anarkali",
    status: "Active",
    isBestseller: true,
    sizes: ["S", "M", "L", "XL"],
    slug: "royal-blue-anarkali-suit"
  },
  {
    id: "saree-1",
    name: "Crimson Red Silk Saree",
    category: "Sarees",
    subCategory: "Sarees",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    stock: 5,
    images: ["/images/saree_red.jpg"],
    description: "Pure silk saree in crimson red with zari border.",
    shortDescription: "Pure Silk Zari Saree",
    status: "Active",
    isFeatured: true,
    isNewArrival: true,
    slug: "crimson-red-silk-saree"
  },
  {
    id: "art-elephant",
    name: "Royal Elephant Fabric Art",
    category: "Fabric Art",
    price: 3200,
    stock: 8,
    images: ["/images/art_elephant.jpg"],
    description: "Hand-painted fabric art featuring a royal elephant.",
    shortDescription: "Hand-painted Elephant",
    status: "Active",
    slug: "royal-elephant-fabric-art"
  }
];

export async function GET() {
  try {
    await connectDB();
    // Wipe all existing products
    await Product.deleteMany({});
    
    // Seed new products
    const inserted = await Product.insertMany(seedProducts);
    
    return NextResponse.json({ success: true, count: inserted.length, products: inserted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
