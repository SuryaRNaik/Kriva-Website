import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const customers = await Customer.find({ role: 'customer' }).sort({ createdAt: -1 }).select("-password").lean();
    
    // For each customer, aggregate their orders
    // In a huge database, we would use MongoDB aggregate pipelines. 
    // Here we will do it efficiently enough for the current scale.
    const allOrders = await Order.find({}).lean();
    
    const customersWithStats = customers.map(customer => {
      const customerOrders = allOrders.filter(o => o.customer?.email === customer.email);
      
      const totalOrders = customerOrders.length;
      const activeOrders = customerOrders.filter(o => !["Delivered", "Cancelled"].includes(o.trackingStatus || o.orderStatus)).length;
      const cancelledOrders = customerOrders.filter(o => o.orderStatus === "Cancelled").length;
      const deliveredOrders = customerOrders.filter(o => o.trackingStatus === "Delivered").length;
      
      const totalSpent = customerOrders
        .filter(o => o.orderStatus !== "Cancelled")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
      return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        createdAt: customer.createdAt,
        totalOrders,
        activeOrders,
        cancelledOrders,
        deliveredOrders,
        totalSpent
      };
    });
    
    return NextResponse.json({ success: true, customers: customersWithStats });
  } catch (error: any) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
