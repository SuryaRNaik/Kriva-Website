import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import crypto from "crypto";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation";
import { logEvent } from "@/lib/logger";

export async function POST(req: Request) {
  // Forgot password rate limiting: 3 attempts / 60 minutes
  const rlResponse = await checkRateLimit(req, "forgot-password", 3, 60);
  if (rlResponse) return rlResponse;

  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const email = result.data.email.toLowerCase();

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
      logEvent("info", "password_reset_requested", { userId: customer._id.toString(), email });
    } else {
      logEvent("warning", "password_reset_requested_unregistered_email", { email });
    }

    return NextResponse.json({ success: true, message: "If that email is registered, you will receive a password reset link shortly." }, { status: 200 });
  } catch (error: any) {
    logEvent("error", "forgot_password_error", { error: error.message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
