"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
    } catch {
      setError("网络错误，请检查连接后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex min-h-svh items-center justify-center overflow-y-auto bg-stone-100 px-4 py-6 dark:bg-stone-950 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,241,230,0.94),rgba(236,253,245,0.9),rgba(231,229,228,0.92))] dark:bg-[linear-gradient(135deg,rgba(12,10,9,0.96),rgba(41,37,36,0.92),rgba(20,83,45,0.34))]" />

      <div className="relative grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-stone-900/80 lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between border-r border-white/70 bg-sage-50/70 p-8 text-stone-900 dark:border-white/10 dark:bg-stone-900/60 lg:flex xl:p-10">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-600 shadow-md">
              <LockIcon />
            </div>
            <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight tracking-normal text-stone-950 dark:text-stone-100">
              考研学习助手
            </h1>
            <p className="mt-4 max-w-md text-sm font-medium leading-7 text-stone-600 dark:text-stone-300">
              用任务、错题、知识点和 AI 对话统一管理你的备考节奏。
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            {[
              ["任务进度", "今日安排与长期规划分开管理"],
              ["知识沉淀", "错题、公式、词汇和作文素材统一归档"],
              ["AI 助手", "保留历史对话，支持多模型切换"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="font-black text-stone-900 dark:text-stone-100">{title}</p>
                <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex min-h-[calc(100svh-3rem)] items-center justify-center p-5 sm:min-h-[620px] sm:p-8 lg:min-h-0">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[360px] rounded-3xl border border-white/75 bg-white/90 p-5 shadow-float backdrop-blur-xl dark:border-white/10 dark:bg-stone-900/90 sm:max-w-[400px] sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
          >
            <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-600 shadow-md lg:hidden">
                <LockIcon />
              </div>
              <span className="mt-4 rounded-full border border-sage-200 bg-sage-50 px-3 py-1 text-xs font-black text-sage-700 dark:border-sage-800 dark:bg-sage-900/30 dark:text-sage-300 lg:mt-0">
                访问保护
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-normal text-stone-950 dark:text-stone-100 sm:text-3xl">
                输入密码继续
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
                登录后会回到你刚才访问的页面。
              </p>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                  setSuccess(false);
                }}
                placeholder="管理员密码"
                autoFocus
                autoComplete="current-password"
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 pr-12 text-base font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-sage-400 focus:bg-white focus:ring-4 focus:ring-sage-100 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800/70 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-sage-500 dark:focus:bg-stone-800 dark:focus:ring-sage-900/40 sm:h-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                tabIndex={-1}
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-600 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-3 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold leading-6 text-sage-700 dark:border-sage-800 dark:bg-sage-950/30 dark:text-sage-300">
                密码正确，正在跳转...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-sage-600 px-4 text-sm font-black text-white shadow-md transition-all hover:bg-sage-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none dark:disabled:bg-stone-700 sm:h-14"
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[120] flex min-h-svh items-center justify-center bg-stone-100 dark:bg-stone-900">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sage-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
