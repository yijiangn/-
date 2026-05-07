"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
      } else {
        setError("密码错误");
      }
    } catch {
      setError("验证失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-stone-900">
      <form
        onSubmit={handleSubmit}
        className="mx-4 flex w-full max-w-sm flex-col gap-5 rounded-3xl bg-white/70 p-10 shadow-soft backdrop-blur-xl dark:bg-stone-800/70"
      >
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
            考研学习助手
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            请输入访问密码
          </p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理员密码"
          autoFocus
          disabled={loading}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:focus:border-sage-500 dark:focus:ring-sage-800"
        />
        {error && (
          <p className="text-center text-sm text-rose-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-sage-600 py-3 font-semibold text-white transition hover:bg-sage-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "验证中..." : "进入"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-stone-900">
          <p className="text-stone-500">加载中...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
