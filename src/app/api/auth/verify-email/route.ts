import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    await connectDB();
    
    const customer = await Customer.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!customer) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    customer.emailVerified = true;
    customer.verifyToken = undefined;
    customer.verifyTokenExpiry = undefined;
    await customer.save();

    return NextResponse.json({ success: true, message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
