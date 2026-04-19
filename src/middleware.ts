import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Allow the login page itself
  if (pathname === "/dashboard/login") {
    return NextResponse.next();
  }

  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return NextResponse.next();

  const token = request.cookies.get("dashboard_token")?.value;

  if (token !== secret) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
