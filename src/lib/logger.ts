// src/lib/logger.ts

export type LogLevel = "info" | "warning" | "error" | "security";

export interface LogContext {
  userId?: string;
  role?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  statusCode?: number;
  [key: string]: any;
}

// Sensitive keys to redact
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "otp",
  "email",
  "phone",
  "phonenumber",
  "address",
  "billingaddress",
  "shippingaddress",
  "card",
  "cvv",
  "razorpay_signature",
  "razorpay_payment_id",
  "razorpay_order_id",
]);

function redactData(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(redactData);
  }

  if (typeof data === "object") {
    const redacted = { ...data };
    for (const key in redacted) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactData(redacted[key]);
      }
    }
    return redacted;
  }

  return data;
}

export function logEvent(
  level: LogLevel,
  eventType: string,
  context: LogContext = {}
) {
  const timestamp = new Date().toISOString();
  
  const redactedContext = redactData(context);
  
  const logEntry = {
    timestamp,
    level,
    eventType,
    ...redactedContext,
  };

  const logString = JSON.stringify(logEntry);

  switch (level) {
    case "info":
      console.log(logString);
      break;
    case "warning":
      console.warn(logString);
      break;
    case "error":
      console.error(logString);
      break;
    case "security":
      // Security events are usually errors or critical warnings, log to error stream
      console.error(logString);
      break;
    default:
      console.log(logString);
  }
}
