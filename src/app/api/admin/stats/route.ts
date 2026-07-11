import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Fetch base collections
    const allOrders = await Order.find({}).lean();
    const validOrders = allOrders.filter(o => o.orderStatus !== "Cancelled");
    
    // Revenue & Core Stats
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
    const revenueToday = todaysOrders
      .filter(o => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
    // Pending Orders count (using explicit valid stages)
    const pendingOrders = validOrders.filter(o => ["Order Received", "Crafting in Progress", "Quality Check", "Packed"].includes(o.trackingStatus || "Order Received")).length;
    
    // Customer metrics
    const totalCustomers = await Customer.countDocuments({ role: 'customer' });
    const conversionRate = 2.4; // Placeholder for analytics (usually needs page views data)

    // Top Selling Products Calculation
    const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
    validOrders.forEach(order => {
      order.orderItems?.forEach((item: any) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, sold: 0, revenue: 0 };
        }
        productSales[item.name].sold += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Monthly Revenue (Last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      
      const monthOrders = validOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === targetMonth && orderDate.getFullYear() === targetYear;
      });
      
      const rev = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      monthlyRevenue.push({
        month: monthNames[targetMonth],
        revenue: rev
      });
    }

    const stats = {
      todaysOrdersCount: todaysOrders.length,
      revenueToday,
      totalRevenue,
      avgOrderValue,
      pendingOrders,
      totalCustomers,
      conversionRate,
      topProducts,
      monthlyRevenue
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

