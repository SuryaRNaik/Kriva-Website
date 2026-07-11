import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { action, productIds } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ success: false, error: "No products selected" }, { status: 400 });
    }

    await connectDB();

    let updateData = {};
    switch (action) {
      case "publish":
        updateData = { status: "Active" };
        break;
      case "archive":
        updateData = { status: "Inactive" };
        break;
      case "trash":
        updateData = { isTrashed: true };
        break;
      case "restore":
        updateData = { isTrashed: false };
        break;
      case "bestseller":
        updateData = { isBestseller: true };
        break;
      case "featured":
        updateData = { isFeatured: true };
        break;
      case "delete":
        await Product.deleteMany({ _id: { $in: productIds } });
        return NextResponse.json({ success: true, message: "Products permanently deleted" });
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: `Bulk action '${action}' completed successfully` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
