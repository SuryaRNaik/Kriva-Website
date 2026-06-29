import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";

export async function GET(req: Request) {
  try {
    await connectDB();
    const orders = await Order.find().populate('customer').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const { 
      orderId, 
      trackingStatus,
      courierName,
      trackingNumber,
      dispatchDate,
      expectedDeliveryDate,
      shippingNotes,
      deliveryMethod
    } = await req.json();
    
    if (!orderId || !trackingStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingOrder = await Order.findOne({ orderId }).populate('customer');
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = existingOrder.trackingStatus;
    
    // Auto-set dispatchDate if changing to Shipped
    let finalDispatchDate = dispatchDate;
    if (trackingStatus === 'Shipped' && !finalDispatchDate) {
      finalDispatchDate = new Date();
    }

    const updateFields = {
      trackingStatus,
      courierName,
      trackingNumber,
      dispatchDate: finalDispatchDate,
      expectedDeliveryDate,
      shippingNotes,
      deliveryMethod
    };

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
