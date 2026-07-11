import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import type { CreateOrderPayload, CreateOrderResponse } from "@/types/payment";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { checkRateLimit } from "@/lib/rate-limit";
import { createOrderSchema, sanitizeRichText } from "@/lib/validation";
import { logEvent } from "@/lib/logger";

export async function POST(req: Request) {
  // Create Order rate limiting: 10 requests / 15 minutes
  const rlResponse = await checkRateLimit(req, "create-order", 10, 15);
  if (rlResponse) return rlResponse;

  try {
    const rawBody = await req.json();
    const result = createOrderSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const body = result.data;
    
    // Sanitize receipt string just in case
    body.receipt = sanitizeRichText(body.receipt);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured" },
        { status: 500 }
      );
    }

    await connectDB();
    const session = await getServerSession(authOptions);
    let customerEmail = body.notes?.customer_email;

    if (session && session.user?.email) {
      // Logged-in user: Always use session email and ignore frontend email
      customerEmail = session.user.email;
      if (body.notes) {
        body.notes.customer_email = session.user.email;
      }
    } else if (customerEmail) {
      // Guest Checkout: Check if email already belongs to a registered account
      const existingCustomer = await Customer.findOne({ email: customerEmail.toLowerCase() });
      if (existingCustomer && (existingCustomer.password || existingCustomer.googleId)) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in to continue." },
          { status: 401 }
        );
      }
    }

    // Create an order in Razorpay
    const options = {
      amount: body.amount,
      currency: body.currency,
      receipt: body.receipt,
      notes: body.notes || {},
    };

    const order = await razorpay.orders.create(options as any);

    const responseData: CreateOrderResponse = {
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    };

    logEvent("info", "payment_order_created", { orderId: order.id, amount: order.amount, customerEmail });
    return NextResponse.json(responseData);
  } catch (error: any) {
    logEvent("error", "payment_order_creation_failed", { error: error.message });
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
