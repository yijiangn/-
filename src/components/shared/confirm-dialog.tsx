"use client";

import { AlertTriangleIcon, XIcon } from "@/components/ui/icons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  tone = "default",
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  const isDanger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-stone-950/35 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-5 text-stone-900 shadow-float backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
              isDanger ? "bg-rose-50 text-rose-600" : "bg-sage-50 text-sage-700"
            }`}
          >
            <AlertTriangleIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black leading-6 text-stone-950">{title}</h2>
            {description ? <p className="mt-2 text-sm font-medium leading-6 text-stone-600">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="关闭确认弹窗"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition ${
              isDanger ? "bg-rose-600 hover:bg-rose-700" : "bg-moss-700 hover:bg-moss-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
