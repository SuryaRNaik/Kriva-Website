import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { razorpay } from "@/lib/razorpay";
import { sendEmail, getCustomerRefundEmailHtml, getOwnerCancellationEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, orderId, cancellationReason } = await req.json();

    if (!email || !orderId || !cancellationReason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const order: any = await Order.findOne({ orderId }).populate("customer");

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 401 });
    }

    // Business rules validation
    if (order.orderStatus === "Cancelled") {
      return NextResponse.json({ success: false, error: "Order is already cancelled" }, { status: 400 });
    }

    if (order.trackingStatus !== "Order Received") {
      return NextResponse.json({ success: false, error: "Cannot cancel order once crafting has started" }, { status: 400 });
    }

    const now = new Date();
    if (now > order.cancellationDeadline) {
      return NextResponse.json({ success: false, error: "Cancellation window (3 working days) has expired" }, { status: 400 });
    }

    // Proceed with Razorpay Refund
    let refund;
    try {
      refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: order.totalAmount * 100, // Amount in paise
        speed: "optimum",
      });
    } catch (rzpError: any) {
      console.error("Razorpay refund failed:", rzpError);
      return NextResponse.json(
        { success: false, error: "Payment gateway rejected the refund. Please contact support." },
        { status: 500 }
      );
    }

    // Atomic MongoDB Update
    order.orderStatus = "Cancelled";
    order.refundStatus = "Processed";
    order.refundId = refund.id;
    order.refundDate = new Date();
    order.cancellationReason = cancellationReason;
    
    await order.save();

    // Send Emails
    try {
      const customerHtml = getCustomerRefundEmailHtml(order.customer, order, refund.id);
      await sendEmail({
        to: order.customer.email,
        subject: `Refund Initiated - Kriva Studio (${order.orderId})`,
        html: customerHtml,
      });

      if (process.env.SMTP_EMAIL) {
        const ownerHtml = getOwnerCancellationEmailHtml(order.customer, order, refund.id, cancellationReason);
        await sendEmail({
          to: process.env.SMTP_EMAIL,
          subject: `ORDER CANCELLED - ${order.orderId}`,
          html: ownerHtml,
        });
      }
    } catch (emailError) {
      console.error("Failed to send cancellation emails:", emailError);
      // We don't fail the refund if email fails
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred processing the cancellation" },
      { status: 500 }
    );
  }
}
