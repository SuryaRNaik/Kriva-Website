import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";

export async function GET(req: Request) {
  try {
    await connectDB();
    const orders = await Order.find().populate('customer').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { orderId, trackingStatus } = await req.json();
    
    if (!orderId || !trackingStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { trackingStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
