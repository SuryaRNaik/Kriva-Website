import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingCustomer = await Customer.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingCustomer) {
      if (existingCustomer.password) {
        return NextResponse.json(
          { error: "Account with this email already exists" },
          { status: 409 }
        );
      } else {
        // Guest account found. Update it with the password to link it!
        existingCustomer.password = hashedPassword;
        existingCustomer.name = name; // Update name in case they used a different one
        await existingCustomer.save();
        
        return NextResponse.json(
          { success: true, message: "Guest account linked and activated successfully." },
          { status: 200 }
        );
      }
    }

    // New customer
    await Customer.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
