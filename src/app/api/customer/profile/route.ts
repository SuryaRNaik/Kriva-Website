import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { profileUpdateSchema, sanitizeStrict } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customer = await Customer.findOne({ email: session.user.email }).select("-password -verifyToken -verifyTokenExpiry -resetToken -resetTokenExpiry -failedLoginAttempts -lockUntil");
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, address, city, pincode } = result.data;
    const sanitizedPhone = sanitizeStrict(phone);
    const sanitizedAddress = sanitizeStrict(address);
    const sanitizedCity = sanitizeStrict(city);
    const sanitizedPincode = sanitizeStrict(pincode);

    await connectDB();
    const customer = await Customer.findOneAndUpdate(
      { email: session.user.email },
      { 
        phone: sanitizedPhone, 
        address: sanitizedAddress, 
        city: sanitizedCity, 
        pincode: sanitizedPincode 
      },
      { new: true }
    ).select("-password -verifyToken -verifyTokenExpiry -resetToken -resetTokenExpiry -failedLoginAttempts -lockUntil");

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
