import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/",
  "/tasks",
  "/mistakes",
  "/knowledge",
  "/stats",
  "/data",
  "/search",
  "/settings",
  "/ai",
];

function isProtected(pathname: string) {
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return false;
  }
  if (pathname.startsWith("/api/")) {
    return true;
  }
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest")
  ) {
    return false;
  }
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;

  if (isProtected(pathname) && token !== process.env.ADMIN_TOKEN) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)",
  ],
};
