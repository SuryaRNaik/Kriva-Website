// src/lib/env.ts

const requiredEnvs = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID"
];

export function validateEnv() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);

  if (missingEnvs.length > 0) {
    // We log securely, no values, just the missing keys
    console.error(
      `[SECURITY ERROR] Missing required production environment variables: ${missingEnvs.join(
        ", "
      )}`
    );
    throw new Error("Missing required production environment variables.");
  }
}
