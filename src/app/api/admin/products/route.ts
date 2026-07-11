import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { productSchema, sanitizeRichText, sanitizeStrict } from "@/lib/validation";
import { logEvent } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    logEvent("error", "fetch_products_error", { error: error.message });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const rawBody = await req.json();
    const result = productSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const body = result.data;
    if (body.description) body.description = sanitizeRichText(body.description);
    if (body.shortDescription) body.shortDescription = sanitizeRichText(body.shortDescription);
    if (body.name) body.name = sanitizeStrict(body.name);
    
    // Auto-generate SKU if not provided
    if (!body.sku) {
      body.sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Auto-generate unique ID if not provided (for frontend legacy compatibility)
    if (!body.id) {
      body.id = 'prod-' + Date.now();
    }

    // Auto-generate Slug if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    const product = await Product.create(body);
    logEvent("info", "product_created", { productId: product._id.toString(), sku: product.sku });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    logEvent("error", "create_product_error", { error: error.message });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const rawBody = await req.json();
    
    // We can use safeParse but PUT might have partial data or full data with _id.
    const { _id, ...updateDataRaw } = rawBody;
    const result = productSchema.safeParse(updateDataRaw);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const updateData = result.data;
    if (updateData.description) updateData.description = sanitizeRichText(updateData.description);
    if (updateData.shortDescription) updateData.shortDescription = sanitizeRichText(updateData.shortDescription);
    if (updateData.name) updateData.name = sanitizeStrict(updateData.name);

    if (!updateData.slug && updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }

    const product = await Product.findByIdAndUpdate(_id, updateData, { new: true });
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    
    logEvent("info", "product_updated", { productId: product._id.toString(), sku: product.sku });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    logEvent("error", "update_product_error", { error: error.message });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    await connectDB();
    await Product.findByIdAndDelete(id);
    
    logEvent("info", "product_deleted", { productId: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logEvent("error", "delete_product_error", { error: error.message });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
