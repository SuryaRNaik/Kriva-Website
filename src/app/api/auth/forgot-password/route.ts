import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import crypto from "crypto";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    
    const customer = await Customer.findOne({ email });

    // Do not reveal if the user exists or not for security reasons
    if (customer) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      customer.resetToken = resetToken;
      customer.resetTokenExpiry = resetTokenExpiry;
      await customer.save();

      await sendEmail({
        to: email,
        subject: "Reset your Kriva Studio Password",
        html: getPasswordResetEmailHtml(resetToken),
      });
    }

    return NextResponse.json({ success: true, message: "If that email is registered, you will receive a password reset link shortly." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
