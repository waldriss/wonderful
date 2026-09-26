import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (no API call — fast)
  const sessionCookie = getSessionCookie(request);

  // Protect /dashboard/* — redirect to /auth if not authenticated
  if (pathname.startsWith("/dashboard") && !sessionCookie) {
    const returnUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth?returnUrl=${returnUrl}`, request.url)
    );
  }

  // Redirect already-authenticated users away from /auth
  if (pathname === "/auth" && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Forward pathname as header so server layouts can build returnUrl for redirects
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
