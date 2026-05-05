"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, SettingsIcon, UserCircleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { AuthSessionProfile } from "@/services/auth";

interface TopbarUserMenuProps {
  profile: AuthSessionProfile | null;
  status: "disabled" | "disconnected" | "loading" | "connected";
  isConnected: boolean;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthSessionProfile | null>;
  connectWithAccessToken: (accessToken: string) => Promise<AuthSessionProfile | null>;
  disconnect: () => void;
}

function getMetadataString(profile: AuthSessionProfile | null, keys: string[]) {
  if (!profile?.userMetadata) {
    return null;
  }

  for (const key of keys) {
    const value = profile.userMetadata[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getDisplayName(profile: AuthSessionProfile | null) {
  return getMetadataString(profile, ["full_name", "name", "display_name"]) || profile?.email?.split("@")[0] || "本地用户";
}

function getInitials(profile: AuthSessionProfile | null) {
  return getDisplayName(profile).slice(0, 2).toUpperCase();
}

export function TopbarUserMenu({
  profile,
  status,
  isConnected,
  isLoading,
  signInWithPassword,
  connectWithAccessToken,
  disconnect
}: TopbarUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const displayName = useMemo(() => getDisplayName(profile), [profile]);
  const initials = useMemo(() => getInitials(profile), [profile]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextProfile = await signInWithPassword(email, password);
      if (nextProfile) {
        setPassword("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTokenLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextProfile = await connectWithAccessToken(tokenInput);
      if (nextProfile) {
        setTokenInput("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="打开用户菜单"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/50 bg-white/65 text-xs font-black text-moss-800 shadow-sm transition hover:scale-105 hover:bg-white"
      >
        {isConnected ? initials : <UserCircleIcon className="h-5 w-5" />}
        <span
          className={cn(
            "absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
            isConnected ? "bg-moss-500" : status === "disabled" ? "bg-stone-300" : "bg-amber-400"
          )}
        />
      </button>

      {open ? (
        <div className="fixed right-4 top-[72px] z-[130] w-[min(360px,calc(100vw-2rem))] rounded-[30px] border border-white/70 bg-white/90 p-4 text-stone-800 shadow-float backdrop-blur-2xl lg:right-6">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-moss-50 text-sm font-black text-moss-800">
              {isConnected ? initials : <UserCircleIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-stone-950">{displayName}</p>
              <p className="mt-1 truncate text-xs text-stone-500">
                {profile?.email || (status === "disabled" ? "Supabase 未配置" : "尚未连接云端账号")}
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                  isConnected ? "bg-moss-50 text-moss-700" : "bg-amber-50 text-amber-700"
                )}
              >
                {isConnected ? "云端已连接" : status === "loading" || isLoading ? "正在校验" : "本地模式"}
              </span>
            </div>
          </div>

          {!isConnected ? (
            <div className="mt-4 rounded-[24px] border border-stone-200 bg-stone-50/85 p-3">
              <form onSubmit={handlePasswordLogin}>
                <p className="text-xs font-semibold text-stone-700">登录 Supabase 账号</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  使用 Supabase Auth 的邮箱密码登录，登录后任务、错题、知识点会走云端数据源。
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="邮箱"
                  className="mt-3 w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-sage-300"
                  disabled={status === "disabled" || submitting}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="密码"
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-sage-300"
                  disabled={status === "disabled" || submitting}
                />
                <button
                  type="submit"
                  disabled={status === "disabled" || submitting}
                  className="mt-3 w-full rounded-full bg-moss-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {submitting ? "登录中..." : "登录云端账号"}
                </button>
              </form>

              <details className="mt-3 rounded-2xl bg-white/70 px-3 py-2">
                <summary className="cursor-pointer text-xs font-bold text-stone-500">使用 access token 连接</summary>
                <form onSubmit={handleTokenLogin} className="mt-3">
                  <textarea
                    value={tokenInput}
                    onChange={(event) => setTokenInput(event.target.value)}
                    placeholder="粘贴 Supabase access token"
                    className="min-h-[70px] w-full resize-none rounded-2xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-sage-300"
                    disabled={status === "disabled" || submitting}
                  />
                  <button
                    type="submit"
                    disabled={status === "disabled" || submitting}
                    className="mt-2 w-full rounded-full border border-sage-200 bg-sage-50 px-4 py-2 text-xs font-bold text-sage-800 transition hover:bg-sage-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    连接 access token
                  </button>
                </form>
              </details>
            </div>
          ) : null}

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => {
                router.push("/settings");
                setOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/80 px-3 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              <SettingsIcon className="h-4 w-4" />
              打开设置
            </button>

            {isConnected ? (
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-white"
              >
                <LogOutIcon className="h-4 w-4" />
                断开云端账号
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
