import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { SERVER_PRODUCTS } from "@/lib/server-products";

// GET all products. Auto-seeds from SERVER_PRODUCTS if the DB is completely empty.
export async function GET() {
  try {
    await connectDB();
    
    let products = await Product.find({}).sort({ createdAt: -1 });
    
    // Auto-seed if empty
    if (products.length === 0) {
      console.log("No products found in DB. Seeding from SERVER_PRODUCTS...");
      const seedData = Object.entries(SERVER_PRODUCTS).map(([id, data]) => ({
        id,
        name: id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        price: data.price,
        stock: 10,
        category: id.includes("tanjore") || id.includes("elephant") || id.includes("lotus") ? "Tanjore" : "Apparel",
      }));
      
      if (seedData.length > 0) {
        await Product.insertMany(seedData);
        products = await Product.find({}).sort({ createdAt: -1 });
      }
    }
    
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT to update stock manually
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { id, stock } = await req.json();
    
    if (!id || typeof stock !== 'number') {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }
    
    const product = await Product.findOneAndUpdate(
      { id },
      { stock },
      { new: true }
    );
    
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Failed to update stock:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
