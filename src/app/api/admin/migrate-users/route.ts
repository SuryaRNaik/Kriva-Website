import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all customers where emailVerified is null or exists is false
    const filter = { 
      emailVerified: { $exists: false } 
    };

    const update = {
      $set: { emailVerified: true }
    };

    const result = await Customer.updateMany(filter, update);

    return NextResponse.json({
      success: true,
      message: "Legacy users migrated successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
