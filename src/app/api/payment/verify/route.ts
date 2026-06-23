import { NextResponse } from "next/server";
import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";
import { 
  sendEmail, 
  getWorkshopConfirmationEmailHtml,
  getOwnerOrderNotificationHtml,
  getCustomerOrderConfirmationHtml
} from "@/lib/email";
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
    
    // Force Capture the payment so funds settle to the bank account immediately
    try {
      await razorpay.payments.capture(razorpay_payment_id, totalAmount * 100, "INR");
    } catch (captureError) {
      console.error("Payment capture failed or was already captured:", captureError);
    }

    // Generate a pseudo-random internal order ID
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Send emails based on order type
    if (orderType === "workshop" && workshopDetails) {
      const emailHtml = getWorkshopConfirmationEmailHtml(
        customerDetails.name,
        workshopDetails.title,
        workshopDetails.date,
        workshopDetails.time,
        workshopDetails.location,
        internalOrderId
      );

      sendEmail({
        to: customerDetails.email,
        subject: "Booking Confirmed: Tanjore Painting Workshop - Kriva Studio",
        html: emailHtml,
      }).catch(err => console.error("Failed to send workshop confirmation email", err));
      
      // Notify owner
      if (process.env.SMTP_EMAIL) {
        sendEmail({
          to: process.env.SMTP_EMAIL,
          subject: `New Workshop Booking: ${workshopDetails.title}`,
          html: `<p>New booking from ${customerDetails.name} (${customerDetails.email}, ${customerDetails.phone}) for ${workshopDetails.title}. Order ID: ${internalOrderId}.</p>`,
        }).catch(err => console.error("Failed to notify owner", err));
      }
    } else if (orderType === "shop") {
      // Send to Customer
      const customerHtml = getCustomerOrderConfirmationHtml(
        customerDetails,
        items || [],
        totalAmount,
        internalOrderId
      );
      sendEmail({
        to: customerDetails.email,
        subject: `Order Confirmed - Kriva Studio (${internalOrderId})`,
        html: customerHtml,
      }).catch(err => console.error("Failed to send shop confirmation to customer", err));

      // Send to Owner
      if (process.env.SMTP_EMAIL) {
        const ownerHtml = getOwnerOrderNotificationHtml(
          customerDetails,
          items || [],
          totalAmount,
          internalOrderId
        );
        sendEmail({
          to: process.env.SMTP_EMAIL,
          subject: `NEW ORDER RECEIVED - ${internalOrderId}`,
          html: ownerHtml,
        }).catch(err => console.error("Failed to notify owner", err));
      }
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
