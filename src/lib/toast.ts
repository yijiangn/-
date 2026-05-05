"use client";

export type ToastTone = "success" | "error" | "info";

export interface ToastPayload {
  title: string;
  description?: string;
  tone?: ToastTone;
  dedupeKey?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  durationMs?: number;
}

const TOAST_EVENT_NAME = "kaoyan-study:toast";

export function emitToast(payload: ToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, { detail: payload }));
}

export function notifySuccess(title: string, description?: string, dedupeKey?: string) {
  emitToast({ title, description, tone: "success", dedupeKey });
}

export function notifyError(title: string, description?: string, dedupeKey?: string) {
  emitToast({ title, description, tone: "error", dedupeKey });
}

export function notifyInfo(title: string, description?: string, dedupeKey?: string) {
  emitToast({ title, description, tone: "info", dedupeKey });
}

export function notifyUndo(title: string, description: string, onUndo: () => void, dedupeKey?: string) {
  emitToast({
    title,
    description,
    tone: "info",
    dedupeKey,
    durationMs: 5200,
    action: {
      label: "撤销",
      onClick: onUndo
    }
  });
}

export function getToastEventName() {
  return TOAST_EVENT_NAME;
}
