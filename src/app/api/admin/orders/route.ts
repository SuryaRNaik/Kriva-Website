import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateOrderSchema, sanitizeStrict, sanitizeRichText } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find().populate('customer').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const rawBody = await req.json();
    const result = updateOrderSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const body = result.data;

    // Sanitize free-text fields
    if (body.shippingNotes) body.shippingNotes = sanitizeRichText(body.shippingNotes);
    if (body.adminNotes) body.adminNotes = sanitizeRichText(body.adminNotes);
    if (body.deliveryRemarks) body.deliveryRemarks = sanitizeRichText(body.deliveryRemarks);
    if (body.courierName) body.courierName = sanitizeStrict(body.courierName);
    if (body.trackingNumber) body.trackingNumber = sanitizeStrict(body.trackingNumber);
    if (body.courierContact) body.courierContact = sanitizeStrict(body.courierContact);
    if (body.pickupLocation) body.pickupLocation = sanitizeStrict(body.pickupLocation);
    if (body.deliveredBy) body.deliveredBy = sanitizeStrict(body.deliveredBy);
    if (body.receivedBy) body.receivedBy = sanitizeStrict(body.receivedBy);

    const { 
      orderId, 
      trackingStatus,
      courierName,
      trackingNumber,
      dispatchDate,
      expectedDeliveryDate,
      shippingNotes,
      deliveryMethod,
      refundStatus,
      shippingMode,
      dispatchTime,
      courierContact,
      pickupLocation,
      adminNotes,
      deliveredBy,
      receivedBy,
      deliveryRemarks
    } = body;

    const existingOrder = await Order.findOne({ orderId }).populate('customer');
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const parseDate = (val: any) => {
      if (!val || String(val).trim() === "") return null;
      return new Date(val);
    };

    const previousStatus = existingOrder.trackingStatus;
    
    // Auto-set dispatchDate if changing to Shipped
    let finalDispatchDate = parseDate(dispatchDate);
    if (trackingStatus === 'Shipped' && !finalDispatchDate) {
      finalDispatchDate = new Date();
    }

    const updateFields: any = {
      trackingStatus,
      courierName,
      trackingNumber,
      dispatchDate: finalDispatchDate,
      dispatchTime,
      expectedDeliveryDate: parseDate(expectedDeliveryDate),
      shippingNotes,
      shippingMode,
      courierContact,
      pickupLocation,
      adminNotes,
      deliveredBy,
      receivedBy,
      deliveryRemarks,
      deliveryMethod
    };

    if (refundStatus !== undefined) {
      updateFields.refundStatus = refundStatus;
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      updateFields,
      { new: true }
    ).populate('customer');

    // Trigger emails asynchronously if status changed
    if (previousStatus !== trackingStatus) {
      const { sendEmail, getShippingNotificationHtml, getDeliveryConfirmationHtml } = await import("@/lib/email");
      const customerEmail = order.customer?.email;
      const customerName = order.customer?.name || "Customer";

      if (trackingStatus === 'Shipped' && customerEmail) {
        const html = getShippingNotificationHtml(
          customerName,
          order.orderId,
          order.courierName || 'N/A',
          order.trackingNumber || 'N/A',
          order.dispatchDate ? new Date(order.dispatchDate).toLocaleDateString() : 'N/A',
          order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : ''
        );
        sendEmail({ to: customerEmail, subject: "Your Kriva Studio order has shipped!", html }).catch(console.error);
      } else if (trackingStatus === 'Delivered' && customerEmail) {
        const html = getDeliveryConfirmationHtml(customerName, order.orderId);
        sendEmail({ to: customerEmail, subject: "Your Kriva Studio order has been delivered", html }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
