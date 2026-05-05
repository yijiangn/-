"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangleIcon, CheckIcon, SparklesIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { getToastEventName, type ToastPayload, type ToastTone } from "@/lib/toast";

interface ToastItem extends ToastPayload {
  id: string;
  tone: ToastTone;
}

const toneClassMap: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-slate-200 bg-white text-slate-900"
};

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") {
    return <CheckIcon className="h-5 w-5 text-emerald-600" />;
  }

  if (tone === "error") {
    return <AlertTriangleIcon className="h-5 w-5 text-rose-600" />;
  }

  return <SparklesIcon className="h-5 w-5 text-slate-500" />;
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentKeysRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const eventName = getToastEventName();

    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<ToastPayload>;
      const payload = customEvent.detail;

      if (!payload?.title) {
        return;
      }

      if (payload.dedupeKey) {
        const lastSeen = recentKeysRef.current.get(payload.dedupeKey);

        if (lastSeen && Date.now() - lastSeen < 1500) {
          return;
        }

        recentKeysRef.current.set(payload.dedupeKey, Date.now());
      }

      const toast: ToastItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tone: payload.tone ?? "info",
        title: payload.title,
        description: payload.description,
        dedupeKey: payload.dedupeKey,
        action: payload.action,
        durationMs: payload.durationMs
      };

      setToasts((current) => [...current, toast]);
    }

    window.addEventListener(eventName, handleToast as EventListener);
    return () => window.removeEventListener(eventName, handleToast as EventListener);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.durationMs ?? 3600)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const visibleToasts = useMemo(() => toasts.slice(-4), [toasts]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-3 sm:left-auto sm:right-6 sm:top-6 sm:w-[360px]"
    >
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-3xl border px-4 py-3 shadow-float backdrop-blur-sm transition",
            toneClassMap[toast.tone]
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <ToastIcon tone={toast.tone} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-6">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm leading-6 text-slate-600">{toast.description}</p>
              ) : null}
            </div>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  setToasts((current) => current.filter((item) => item.id !== toast.id));
                }}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
