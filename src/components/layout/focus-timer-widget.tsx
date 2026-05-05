"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ClockIcon, PauseIcon, PlayIcon, RefreshIcon, SkipForwardIcon } from "@/components/ui/icons";
import type { FocusTimerState } from "@/hooks/use-focus-timer";
import { cn } from "@/lib/utils";

interface FocusTimerWidgetProps {
  timerState: FocusTimerState;
  formattedTime: string;
  totalSeconds: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateDurations: (focusMinutes: number, breakMinutes: number) => void;
}

export function FocusTimerWidget({
  timerState,
  formattedTime,
  totalSeconds,
  start,
  pause,
  reset,
  skip,
  updateDurations
}: FocusTimerWidgetProps) {
  const [open, setOpen] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(timerState.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(timerState.breakMinutes);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const progress = totalSeconds > 0 ? Math.round(((totalSeconds - timerState.remainingSeconds) / totalSeconds) * 100) : 0;
  const modeLabel = timerState.mode === "focus" ? "专注" : "休息";

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

  useEffect(() => {
    if (open) {
      setFocusMinutes(timerState.focusMinutes);
      setBreakMinutes(timerState.breakMinutes);
    }
  }, [open, timerState.breakMinutes, timerState.focusMinutes]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-xl transition",
          timerState.isRunning
            ? "border-moss-200 bg-moss-50/80 text-moss-800 hover:bg-white"
            : "border-white/50 bg-white/35 text-stone-700 hover:bg-white/55"
        )}
        aria-expanded={open}
        aria-label="打开番茄钟"
      >
        <ClockIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{modeLabel}</span>
        <span className="font-mono text-sm font-black tabular-nums">{formattedTime}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open ? (
        <div className="fixed right-4 top-[86px] z-[180] w-[min(340px,calc(100vw-2rem))] rounded-[30px] border border-white/70 bg-white/90 p-4 text-stone-800 shadow-float backdrop-blur-2xl lg:left-1/2 lg:right-auto lg:-translate-x-1/2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-700">Focus Timer</p>
              <h3 className="mt-1 text-lg font-black text-stone-950">番茄专注</h3>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                {timerState.mode === "focus" ? "保持当前节奏，完成后自动进入休息。" : "短休息结束后回到下一轮专注。"}
              </p>
            </div>

            <div
              className="grid h-20 w-20 shrink-0 place-items-center rounded-full p-1"
              style={{
                background: `conic-gradient(#5f7f58 ${progress * 3.6}deg, rgba(120, 113, 108, 0.16) 0deg)`
              }}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-white">
                <div className="text-center">
                  <p className="font-mono text-lg font-black tabular-nums text-stone-950">{formattedTime}</p>
                  <p className="text-[10px] font-bold text-stone-400">{progress}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={timerState.isRunning ? pause : start}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-moss-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-moss-800"
            >
              {timerState.isRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              {timerState.isRunning ? "暂停" : "开始"}
            </button>
            <button
              type="button"
              onClick={skip}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              <SkipForwardIcon className="h-4 w-4" />
              跳过
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              <RefreshIcon className="h-4 w-4" />
              重置
            </button>
          </div>

          <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50/80 p-3">
            <p className="text-xs font-semibold text-stone-500">周期设置</p>
            <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <label className="text-xs font-medium text-stone-500">
                专注分钟
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={focusMinutes}
                  onChange={(event) => setFocusMinutes(Number(event.target.value))}
                  className="mt-1 w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-sage-300"
                />
              </label>
              <label className="text-xs font-medium text-stone-500">
                休息分钟
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={breakMinutes}
                  onChange={(event) => setBreakMinutes(Number(event.target.value))}
                  className="mt-1 w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-sage-300"
                />
              </label>
              <button
                type="button"
                onClick={() => updateDurations(focusMinutes, breakMinutes)}
                className="rounded-2xl bg-stone-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-moss-800"
              >
                应用
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
            <span>已完成 {timerState.completedCycles} 轮</span>
            <span>
              {timerState.focusMinutes} + {timerState.breakMinutes} 分钟循环
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
