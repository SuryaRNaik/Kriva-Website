import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { checkRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation";
import { logEvent } from "@/lib/logger";

export async function POST(req: Request) {
  // Reset password rate limiting: 3 attempts / 60 minutes
  const rlResponse = await checkRateLimit(req, "reset-password", 3, 60);
  if (rlResponse) return rlResponse;

  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { token, password } = result.data;

    await connectDB();
    
    const customer = await Customer.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!customer) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    customer.password = hashedPassword;
    customer.resetToken = undefined;
    customer.resetTokenExpiry = undefined;
    
    // Also reset lockouts if any
    customer.failedLoginAttempts = 0;
    customer.lockUntil = undefined;
    
    await customer.save();

    logEvent("info", "password_reset_success", { userId: customer._id.toString() });
    
    return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
  } catch (error: any) {
    logEvent("error", "reset_password_error", { error: error.message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
