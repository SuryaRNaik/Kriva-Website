import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect all admin routes EXCEPT the admin login page itself
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
  },
  {
    callbacks: {
      // Return true to allow the middleware function to process the request
      authorized: () => true,
    },
  }
);

// Define which routes this middleware applies to
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
