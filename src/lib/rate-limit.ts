import { NextResponse } from 'next/server';
import { logEvent } from './logger';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (resets on serverless cold starts)
const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * Checks if the request should be rate limited.
 * Returns a NextResponse (HTTP 429) if rate limited, or null if allowed.
 * 
 * @param req The incoming Request object
 * @param action A string identifier for the action (e.g. 'login', 'signup')
 * @param limit Maximum number of requests allowed in the window
 * @param windowMinutes The time window in minutes
 */
export async function checkRateLimit(
  req: Request,
  action: string,
  limit: number,
  windowMinutes: number
): Promise<NextResponse | null> {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const identifier = `${action}:${ip}`;
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;

  let info = rateLimitStore.get(identifier);

  if (!info || now > info.resetTime) {
    info = { count: 1, resetTime: now + windowMs };
  } else {
    info.count++;
  }

  rateLimitStore.set(identifier, info);

  // Periodic cleanup to prevent memory leaks (5% chance to run)
  if (Math.random() < 0.05) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (now > val.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (info.count > limit) {
    if (info.count === limit + 1) {
      logEvent("security", "rate_limit_exceeded", {
        action,
        ip,
        limit,
        windowMinutes,
        userAgent: req.headers.get("user-agent") || "unknown"
      });
    }
    
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(info.resetTime).toISOString(),
          'Retry-After': Math.ceil((info.resetTime - now) / 1000).toString(),
        }
      }
    );
  }

  return null;
}
