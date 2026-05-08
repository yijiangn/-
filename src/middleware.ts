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

  // 只检查 cookie 是否存在（httpOnly cookie 只有通过 API 验证才能获得）
  const hasCookie = request.cookies.has("admin_token");

  if (isProtected(pathname) && !hasCookie) {
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
