"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setSuccess(true);
        setTimeout(() => {
          const redirect = searchParams.get("redirect") || "/";
          router.push(redirect);
        }, 600);
      } else {
        setError(data.error || "密码错误，请重试");
      }
    } catch (err: any) {
      setError("网络错误，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-sage-50 px-4 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-stone-200/60 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-stone-700/40 dark:bg-stone-800/70"
        >
          {/* Logo 区 */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-600 shadow-lg">
              <LockIcon />
            </div>
            <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              考研学习助手
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              请输入访问密码
            </p>
          </div>

          {/* 密码输入 */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setSuccess(false);
              }}
              placeholder="输入管理员密码"
              autoFocus
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 disabled:opacity-60 dark:border-stone-600 dark:bg-stone-700/50 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-sage-500 dark:focus:ring-sage-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* 提示信息 */}
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-2.5 text-center text-sm text-sage-700 dark:border-sage-800 dark:bg-sage-900/20 dark:text-sage-300">
              密码正确，正在跳转...
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                验证中...
              </span>
            ) : (
              "进入"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-stone-900">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
