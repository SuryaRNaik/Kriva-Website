import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    const updated = await Product.findOneAndUpdate(
      { id: "dress-1" },
      { price: 2 },
      { new: true }
    );
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
