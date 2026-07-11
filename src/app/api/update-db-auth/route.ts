import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Only allow admin to trigger this migration
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Update all existing customers to be verified so they aren't locked out
    const result = await Customer.updateMany(
      { emailVerified: { $exists: false } },
      { $set: { emailVerified: true, failedLoginAttempts: 0 } }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Database auth migration complete",
      modifiedCount: result.modifiedCount
    }, { status: 200 });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
