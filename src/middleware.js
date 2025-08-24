import { NextResponse } from "next/server";

export function middleware(request) {
  // Placeholder for future auth-based redirects if using cookies.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/upload", "/sign/:path*"],
};





