import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { shouldRedirectToLogin } from "@/lib/auth/access";

export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(getSessionCookie(request));
  if (!shouldRedirectToLogin(request.nextUrl.pathname, hasSessionCookie)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set(
    "callbackURL",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/review",
    "/review/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
