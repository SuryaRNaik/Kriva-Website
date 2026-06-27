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
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import WorkshopRegistration from "@/models/WorkshopRegistration";
import { SERVER_PRODUCTS, SERVER_WORKSHOPS } from "@/lib/server-products";

export async function POST(req: Request) {
  try {
    const body: VerifyPaymentPayload = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items,
      orderType,
      workshopDetails,
    } = body;
    let { totalAmount } = body;

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

    // Payment signature is valid!
    
    // 1. Validate the true payment amount securely against server-side prices
    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    let expectedAmount = 0;
    
    if (orderType === "shop") {
      expectedAmount = (items || []).reduce((sum: number, item: any) => {
        const product = SERVER_PRODUCTS[item.id];
        if (!product) throw new Error(`Product not found: ${item.id}`);
        return sum + (product.price * item.quantity);
      }, 0);
    } else if (orderType === "workshop" && workshopDetails) {
      const workshop = SERVER_WORKSHOPS[workshopDetails.title];
      if (!workshop) throw new Error(`Workshop not found: ${workshopDetails.title}`);
      expectedAmount = workshop.price;
    }

    if (rzpOrder.amount !== expectedAmount * 100) {
      return NextResponse.json({ error: "Amount mismatch detected. Security validation failed." }, { status: 400 });
    }

    // Use secure expected amount for all downstream operations
    totalAmount = expectedAmount;

    // 2. Idempotency Check (Prevent Replay Attacks)
    await connectDB();
    if (orderType === "workshop") {
      const existing = await WorkshopRegistration.findOne({ razorpayPaymentId: razorpay_payment_id });
      if (existing) {
        return NextResponse.json({ success: true, orderId: existing.orderId, message: "Payment already verified" });
      }
    } else {
      const existing = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
      if (existing) {
        return NextResponse.json({ success: true, orderId: existing.orderId, message: "Payment already verified" });
      }
    }
    
    // 3. Force Capture the payment so funds settle
    try {
      await razorpay.payments.capture(razorpay_payment_id, expectedAmount * 100, "INR");
    } catch (captureError) {
      console.error("Payment capture failed or was already captured:", captureError);
    }

    // Generate a pseudo-random internal order ID
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Database Integration
    try {

      // Find or create customer
      let customer = await Customer.findOne({ email: customerDetails.email });
      if (!customer) {
        customer = await Customer.create({
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: customerDetails.city,
          pincode: customerDetails.pincode,
        });
      } else {
        // Optionally update address if it changed
        customer.address = customerDetails.address;
        customer.city = customerDetails.city;
        customer.pincode = customerDetails.pincode;
        customer.phone = customerDetails.phone;
        await customer.save();
      }

      if (orderType === "workshop" && workshopDetails) {
        await WorkshopRegistration.create({
          orderId: internalOrderId,
          customerName: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          workshopTitle: workshopDetails.title,
          date: workshopDetails.date,
          time: workshopDetails.time,
          location: workshopDetails.location,
          amountPaid: totalAmount,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        });
      } else if (orderType === "shop") {
        await Order.create({
          customer: customer._id,
          orderId: internalOrderId,
          items: items || [],
          totalAmount: totalAmount,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          trackingStatus: "Order Received",
        });
      }
    } catch (dbError) {
      console.error("Database error during order creation:", dbError);
      // We log but do not fail the request if payment succeeded, 
      // though ideally we'd want a robust queue.
    }

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
