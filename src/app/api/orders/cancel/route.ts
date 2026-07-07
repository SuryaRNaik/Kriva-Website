import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendEmail, getCustomerRefundEmailHtml, getOwnerCancellationEmailHtml } from "@/lib/email";
// import { razorpay } from "@/lib/razorpay";

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

    // 1. Customer ownership validation
    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ success: false, error: "Authentication failed. Order does not belong to this email." }, { status: 401 });
    }

    // 2. Final production safety: Must be a paid order
    if (!order.razorpayPaymentId) {
      return NextResponse.json({ success: false, error: "Cannot cancel an unpaid order." }, { status: 400 });
    }

    // 3. Not already cancelled
    if (order.orderStatus === "Cancelled") {
      return NextResponse.json({ success: false, error: "Order is already cancelled" }, { status: 400 });
    }

    // 4. Not already refunded
    if (order.refundStatus !== "None") {
      return NextResponse.json({ success: false, error: "Refund has already been processed or initiated." }, { status: 400 });
    }

    // 5. Not shipped/delivered (Tracking Status check)
    if (order.trackingStatus === "Shipped" || order.trackingStatus === "Delivered") {
      return NextResponse.json({ success: false, error: "Cannot cancel order once it has been shipped or delivered." }, { status: 400 });
    }

    // 6. Within 3 working days (72 hours) logic
    const now = new Date();
    if (now > order.cancellationDeadline) {
      return NextResponse.json({ success: false, error: "Cancellation window (3 working days) has expired." }, { status: 400 });
    }

    // Validation Succeeded! Proceed to cancel and refund.

    // Restore stock atomically
    const stockUpdates = order.items.map((item: any) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $inc: { stock: item.quantity } }
      }
    }));

    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }

    // Refund integration placeholder
    // --------------------------------------------------
    // We are deliberately NOT calling razorpay.payments.refund() here.
    // Refund status is set to Initiated, and the owner will process it later.
    // --------------------------------------------------

    // Update order
    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = "Customer";
    order.refundStatus = "Initiated";
    order.cancellationReason = cancellationReason;
    
    await order.save();

    // Send Emails
    try {
      // NOTE: getCustomerRefundEmailHtml currently expects refundId, we can pass a generic message or "PENDING"
      const customerHtml = getCustomerRefundEmailHtml(order.customer, order, "WILL BE PROCESSED SOON");
      await sendEmail({
        to: order.customer.email,
        subject: `Order Cancelled Successfully - Kriva Studio (${order.orderId})`,
        html: customerHtml,
      });

      if (process.env.SMTP_EMAIL) {
        const ownerHtml = getOwnerCancellationEmailHtml(order.customer, order, "PENDING", cancellationReason);
        await sendEmail({
          to: process.env.SMTP_EMAIL,
          subject: `ORDER CANCELLED - ${order.orderId}`,
          html: ownerHtml,
        });
      }
    } catch (emailError) {
      console.error("Failed to send cancellation emails:", emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error processing cancellation:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred processing the cancellation" },
      { status: 500 }
    );
  }
}
