"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, SettingsIcon } from "@/components/ui/icons";

export function AdminMenu() {
  const [open, setOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="管理员菜单"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-xl border border-white/50 bg-white/65 text-sm font-black text-stone-600 shadow-sm transition hover:scale-105 hover:bg-white"
      >
        <SettingsIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[140] w-44 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-float backdrop-blur-xl">
          <button
            onClick={() => {
              setOpen(false);
              setPwModalOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-700 transition hover:bg-stone-100"
          >
            <SettingsIcon className="h-4 w-4" />
            修改密码
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
          >
            <LogOutIcon className="h-4 w-4" />
            登出
          </button>
        </div>
      )}

      {pwModalOpen && (
        <ChangePasswordModal
          onClose={() => setPwModalOpen(false)}
          onSuccess={() => {
            setPwModalOpen(false);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPw.trim().length < 4) {
      setError("新密码至少 4 个字符");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: oldPw,
          newPassword: newPw.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccess("密码修改成功！其他设备需要重新登录。");
        setTimeout(onSuccess, 1500);
      } else {
        setError(data.error || "修改失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
         onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-stone-200/60 bg-white/95 p-6 shadow-float dark:bg-stone-800/95"
      >
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          修改管理员密码
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          修改后其他设备将自动登出
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            placeholder="当前密码"
            autoFocus
            disabled={loading}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-sage-400 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="新密码（至少 4 个字符）"
            disabled={loading}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-sage-400 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
          />
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-xl border border-sage-200 bg-sage-50 px-4 py-2 text-sm text-sage-700">
            {success}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !oldPw || !newPw}
            className="flex-1 rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-700 disabled:opacity-40"
          >
            {loading ? "修改中..." : "确认修改"}
          </button>
        </div>
      </form>
    </div>
  );
}
