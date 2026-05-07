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
  // 登录页和验证 API 本身不受保护
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return false;
  }
  // 所有 API 都受保护（除 auth）
  if (pathname.startsWith("/api/")) {
    return true;
  }
  // Next.js 内部资源和静态文件
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest")
  ) {
    return false;
  }
  // 检查是否在受保护路径列表中
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;

  // 如果未设置 ADMIN_TOKEN，不拦截（开发环境或未配置时）
  if (!adminToken) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;

  if (isProtected(pathname) && token !== adminToken) {
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
