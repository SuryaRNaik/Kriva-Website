import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Session and email validated
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customer = await Customer.findOne({ email: session.user.email });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
