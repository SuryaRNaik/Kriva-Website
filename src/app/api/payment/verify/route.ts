import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail, getWorkshopConfirmationEmailHtml } from "@/lib/email";
import type { VerifyPaymentPayload, VerifyPaymentResponse } from "@/types/payment";

export async function POST(req: Request) {
  try {
    const body: VerifyPaymentPayload = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items,
      totalAmount,
      orderType,
      workshopDetails,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    // The signature is an HMAC hex digest of "order_id|payment_id" using the secret
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment is verified!
    // In a real application, you would save the order to your database here.
    // For now, we will just return success and let the client handle it.
    
    // Generate a pseudo-random internal order ID
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // If it's a workshop booking, send the confirmation email
    if (orderType === "workshop" && workshopDetails) {
      const emailHtml = getWorkshopConfirmationEmailHtml(
        customerDetails.name,
        workshopDetails.title,
        workshopDetails.date,
        workshopDetails.time,
        workshopDetails.location,
        internalOrderId
      );

      // We don't await this to avoid slowing down the client response,
      // but in a production app you might want to use a background job queue.
      sendEmail({
        to: customerDetails.email,
        subject: "Booking Confirmed: Tanjore Painting Workshop - Kriva Studio",
        html: emailHtml,
      }).catch(err => console.error("Failed to send workshop confirmation email", err));
    }

    const responseData: VerifyPaymentResponse = {
      success: true,
      orderId: internalOrderId,
      message: "Payment verified successfully",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    );
  }
}
