import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { bulkProductSchema } from "@/lib/validation";
import { logEvent } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = bulkProductSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }
    
    const { action, productIds } = result.data;

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
        logEvent("warning", "bulk_products_deleted", { productIds });
        return NextResponse.json({ success: true, message: "Products permanently deleted" });
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    logEvent("info", "bulk_products_updated", { action, productIds });
    return NextResponse.json({ success: true, message: `Bulk action '${action}' completed successfully` });
  } catch (error: any) {
    logEvent("error", "bulk_product_action_error", { error: error.message });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
