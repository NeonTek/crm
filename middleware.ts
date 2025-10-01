import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const { isLoggedIn } = session;
  const { pathname } = req.nextUrl;

  // Define public paths that don't require login
  const publicPaths = ["/portal/login", "/portal/request-id"];

  // If user is not logged in and is trying to access a protected page
  if (!isLoggedIn && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  // If user is logged in and tries to access login or request-id page
  if (isLoggedIn && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/portal/dashboard", req.url));
  }

  return res;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/portal/:path*",
};
