import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import crypto from "crypto";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const existingCustomer = await Customer.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (existingCustomer) {
      if (existingCustomer.password) {
        return NextResponse.json({ error: "Account with this email already exists" }, { status: 409 });
      } else {
        // Guest account found. Update it with the password and verification token.
        existingCustomer.password = hashedPassword;
        existingCustomer.name = name;
        existingCustomer.verifyToken = verifyToken;
        existingCustomer.verifyTokenExpiry = verifyTokenExpiry;
        existingCustomer.emailVerified = false;
        await existingCustomer.save();
        
        // Send email
        await sendEmail({
          to: email,
          subject: "Verify your Kriva Studio account",
          html: getVerificationEmailHtml(verifyToken),
        });

        return NextResponse.json(
          { success: true, message: "Account setup. Please check your email to verify your account." },
          { status: 200 }
        );
      }
    }

    // New customer
    await Customer.create({
      name,
      email,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiry,
      emailVerified: false,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "Verify your Kriva Studio account",
      html: getVerificationEmailHtml(verifyToken),
    });

    return NextResponse.json(
      { success: true, message: "Account created successfully. Please check your email to verify your account." },
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
