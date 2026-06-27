import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { email, orderId } = await req.json();

    if (!email || !orderId) {
      return NextResponse.json(
        { success: false, error: "Email and Order ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Populate customer to check email
    const order: any = await Order.findOne({ orderId }).populate("customer");

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or email mismatch" },
        { status: 404 }
      );
    }

    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Order not found or email mismatch" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error fetching customer order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
