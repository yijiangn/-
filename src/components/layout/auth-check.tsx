"use client";

import { useAuthCheck } from "@/hooks/use-auth-check";

export function AuthCheck() {
  useAuthCheck();
  return null;
}
