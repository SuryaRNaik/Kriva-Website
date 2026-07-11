import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Settings from "@/models/Settings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { settingsSchema, sanitizeStrict } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Create default if none exists
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json();
    const result = settingsSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const body = result.data;
    if (body.storeName) body.storeName = sanitizeStrict(body.storeName);
    if (body.storeAddress) body.storeAddress = sanitizeStrict(body.storeAddress);

    await connectDB();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(body);
    } else {
      settings = await Settings.findOneAndUpdate({}, body, { new: true });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
