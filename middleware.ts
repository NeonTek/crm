import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/api/auth/login", "/api/auth/register"]

  // Check if the current path is a public route
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // If no token, redirect to auth page
  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    // Invalid token, clear cookie and redirect to auth
    const response = NextResponse.redirect(new URL("/auth", request.url))
    response.cookies.delete("token")
    return response
  }

  // Token is valid, continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
