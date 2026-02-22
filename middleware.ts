import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/auth") || path.startsWith("/api/health")) {
    return NextResponse.next();
  }
  if (path.startsWith("/dashboard") || path.startsWith("/docs") || path.startsWith("/modules") || path.startsWith("/settings")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/docs/:path*", "/modules/:path*", "/settings/:path*"],
};
