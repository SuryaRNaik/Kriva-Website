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
import Product from "@/models/Product";
import { SERVER_WORKSHOPS } from "@/lib/server-products";
import { addWorkingDays } from "@/lib/date-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyPaymentSchema, sanitizeStrict } from "@/lib/validation";
import { logEvent } from "@/lib/logger";

export async function POST(req: Request) {
  // Verify Payment rate limiting: 10 requests / 15 minutes
  const rlResponse = await checkRateLimit(req, "verify-payment", 10, 15);
  if (rlResponse) return rlResponse;

  try {
    const rawBody = await req.json();
    const result = verifyPaymentSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const body = result.data;
    
    // Sanitize customer details strings
    body.customerDetails.name = sanitizeStrict(body.customerDetails.name);
    body.customerDetails.address = sanitizeStrict(body.customerDetails.address);
    body.customerDetails.city = sanitizeStrict(body.customerDetails.city);
    body.customerDetails.pincode = sanitizeStrict(body.customerDetails.pincode);

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

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

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

    await connectDB();

    const session = await getServerSession(authOptions);
    if (session && session.user?.email) {
      // Logged-in user: Always use session email and ignore frontend email
      customerDetails.email = session.user.email;
    } else if (customerDetails.email) {
      // Guest Checkout: Check if email already belongs to a registered account
      const existingCustomer = await Customer.findOne({ email: customerDetails.email.toLowerCase() });
      if (existingCustomer && (existingCustomer.password || existingCustomer.googleId)) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in to continue." },
          { status: 401 }
        );
      }
    }

    // 1. Idempotency Check (Prevent Replay Attacks)
    const existingWorkshop = await WorkshopRegistration.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingWorkshop) {
      return NextResponse.json({ success: true, orderId: existingWorkshop.orderId, message: "Payment already verified" });
    }
    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingOrder) {
      return NextResponse.json({ success: true, orderId: existingOrder.orderId, message: "Payment already verified" });
    }

    // 2. Validate amount securely and atomically reserve stock
    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    let expectedAmount = 0;
    const reservedItems: { id: string, quantity: number }[] = [];
    
    try {
      if (orderType === "shop") {
        for (const item of (items || [])) {
          if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error(`Invalid quantity for product: ${item.id}`);
          }

          // Atomically decrement stock
          // Incoming Item: item
          const product = await Product.findOneAndUpdate(
            { id: item.id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: false } // Returns document before update
          );
          // Found Product: product
          if (!product) {
            throw new Error(`Product ${item.id} is out of stock or insufficient quantity`);
          }
          
          reservedItems.push({ id: item.id, quantity: item.quantity });
          expectedAmount += product.price * item.quantity;
        }
      } else if (orderType === "workshop" && workshopDetails) {
        const workshop = SERVER_WORKSHOPS[workshopDetails.title];
        if (!workshop) throw new Error(`Workshop not found: ${workshopDetails.title}`);
        expectedAmount = workshop.price;
      }
      // Amount validation logs removed

      if (rzpOrder.amount !== expectedAmount * 100) {
        throw new Error("Amount mismatch detected. Security validation failed.");
      }
    } catch (validationError: any) {
      // Rollback reserved stock
      console.error("========== VALIDATION ERROR ==========");
      console.error(validationError.message);

      for (const res of reservedItems) {
        await Product.findOneAndUpdate({ id: res.id }, { $inc: { stock: res.quantity } });
      }
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }

    totalAmount = expectedAmount;
    
    // 3. Force Capture the payment so funds settle
    try {
      await razorpay.payments.capture(razorpay_payment_id, expectedAmount * 100, "INR");
    } catch (captureError: any) {
      const errorStr = captureError?.error?.description || captureError?.message || JSON.stringify(captureError);
      if (errorStr && typeof errorStr === 'string' && (errorStr.includes("already been captured") || errorStr.includes("already captured"))) {
        // Payment was already auto-captured by Razorpay (expected condition).
      } else {
        console.error("Payment capture failed:", captureError);
      }
    }

    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Database Integration
    try {
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
        const paymentDate = new Date();
        const cancellationDeadline = addWorkingDays(paymentDate, 3);
        
        await Order.create({
          customer: customer._id,
          orderId: internalOrderId,
          items: items || [],
          totalAmount: totalAmount,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          trackingStatus: "Order Received",
          paymentDate,
          cancellationDeadline,
          orderStatus: "Active",
          refundStatus: "None",
        });
      }
    } catch (dbError) {
      console.error("Database error during order creation:", dbError);
      // Rollback stock because order failed to save
      if (orderType === "shop") {
        for (const res of reservedItems) {
          await Product.findOneAndUpdate({ id: res.id }, { $inc: { stock: res.quantity } });
        }
      }
      return NextResponse.json({ error: "Failed to create order record. Please contact support." }, { status: 500 });
    }

    // Send emails
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
      
      if (process.env.SMTP_EMAIL) {
        sendEmail({
          to: process.env.SMTP_EMAIL,
          subject: `New Workshop Booking: ${workshopDetails.title}`,
          html: `<p>New booking from ${customerDetails.name} (${customerDetails.email}, ${customerDetails.phone}) for ${workshopDetails.title}. Order ID: ${internalOrderId}.</p>`,
        }).catch(err => console.error("Failed to notify owner", err));
      }
    } else if (orderType === "shop") {
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

    logEvent("info", "payment_verified", { orderId: internalOrderId, orderType, amount: totalAmount });

    const responseData: VerifyPaymentResponse = {
      success: true,
      orderId: internalOrderId,
      message: "Payment verified successfully",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    logEvent("error", "payment_verification_error", { error: error.message });
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
