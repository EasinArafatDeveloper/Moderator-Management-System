import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "moderator-management-system-super-secret-key-2026",
  });

  const { pathname } = req.nextUrl;

  // Define public paths that don't require authentication
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/api/auth");

  // If user is not logged in and attempts to access protected routes
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", req.url);
    // Remember redirect destination
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in
  if (token) {
    const role = token.role;

    // Check account status in token (just in case they got suspended while active)
    if (token.status === "Suspended" && pathname !== "/login") {
      // Clear token / force redirect is done best on client, but we redirect here
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "Your account has been suspended.");
      return NextResponse.redirect(loginUrl);
    }

    // Redirect logged in user away from auth pages to their respective dashboards
    if (pathname === "/login" || pathname === "/register" || pathname === "/") {
      if (role === "Admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/moderator/dashboard", req.url));
      }
    }

    // Protect Admin routes
    if (pathname.startsWith("/admin") && role !== "Admin") {
      return NextResponse.redirect(new URL("/moderator/dashboard", req.url));
    }

    // Protect Moderator routes
    if (pathname.startsWith("/moderator") && role !== "Moderator") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (assets folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
