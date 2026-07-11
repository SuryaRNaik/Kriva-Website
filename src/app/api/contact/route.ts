import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactSchema, sanitizeStrict, sanitizeRichText } from "@/lib/validation";

export async function POST(req: Request) {
  // Contact form rate limiting: 5 requests / 60 minutes
  const rlResponse = await checkRateLimit(req, "contact", 5, 60);
  if (rlResponse) return rlResponse;

  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const name = sanitizeStrict(result.data.name);
    const subject = sanitizeStrict(result.data.subject);
    const message = sanitizeRichText(result.data.message);

    await connectDB();
    const contact = await Contact.create({ name, email, subject, message });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit form", details: error.message },
      { status: 500 }
    );
  }
}
