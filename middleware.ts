import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────
// Route Protection Middleware
//
// Runs on every request BEFORE the page renders.
// Redirects unauthenticated users away from
// protected routes to /login.
//
// Key decision: We check for the token in cookies
// here (not localStorage) because middleware runs
// on the server — localStorage is browser-only.
// The auth store saves to both localStorage AND
// a cookie so middleware can read it.
// ─────────────────────────────────────────

const PUBLIC_ROUTES = ["/login", "/register", "/jobs/apply", "/careers"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Allow API routes and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const token = request.cookies.get("hireflow_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};