import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import type { CreateOrderPayload, CreateOrderResponse } from "@/types/payment";

export async function POST(req: Request) {
  try {
    const body: CreateOrderPayload = await req.json();

    if (!body.amount || !body.currency || !body.receipt) {
      return NextResponse.json(
        { error: "Missing required fields (amount, currency, receipt)" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured" },
        { status: 500 }
      );
    }

    // Create an order in Razorpay
    const options = {
      amount: body.amount,
      currency: body.currency,
      receipt: body.receipt,
      notes: body.notes || {},
    };

    const order = await razorpay.orders.create(options);

    const responseData: CreateOrderResponse = {
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
