import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { inventoryUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    let products = await Product.find({}).sort({ createdAt: -1 }).lean();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    return NextResponse.json({ success: true, products, settings });
  } catch (error: any) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT to update stock manually or in bulk
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const rawBody = await req.json();
    const result = inventoryUpdateSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const body = result.data;
    
    if (Array.isArray(body)) {
      // Bulk update
      const bulkOps = body.map(item => ({
        updateOne: {
          filter: { _id: item._id },
          update: { stock: item.stock }
        }
      }));
      await Product.bulkWrite(bulkOps);
      return NextResponse.json({ success: true });
    } else {
      // Single update
      const { _id, id, stock } = body;
      
      const filter = _id ? { _id } : { id };
      const product = await Product.findOneAndUpdate(
        filter,
        { stock },
        { new: true }
      );
      
      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }
  } catch (error: any) {
    console.error("Failed to update stock:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
