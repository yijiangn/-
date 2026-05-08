"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 登录页不检查
    if (pathname === "/login") return;

    const controller = new AbortController();

    fetch("/api/auth/check", { signal: controller.signal })
      .then((res) => {
        if (res.status === 401) {
          // session 过期，跳转登录
          const loginUrl = new URL("/login", window.location.origin);
          loginUrl.searchParams.set("redirect", pathname);
          router.push(loginUrl.toString());
        }
      })
      .catch(() => {
        // 网络错误，忽略
      });

    return () => controller.abort();
  }, [pathname, router]);
}
