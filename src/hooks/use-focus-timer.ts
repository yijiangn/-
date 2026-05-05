"use client";

import { useEffect, useMemo } from "react";
import { localDataKeys, usePersistentState } from "@/lib/local-data";
import { notifyInfo, notifySuccess } from "@/lib/toast";

export type FocusTimerMode = "focus" | "break";

export interface FocusTimerState {
  mode: FocusTimerMode;
  isRunning: boolean;
  remainingSeconds: number;
  focusMinutes: number;
  breakMinutes: number;
  completedCycles: number;
  lastTickAt: number | null;
}

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const defaultFocusTimerState: FocusTimerState = {
  mode: "focus",
  isRunning: false,
  remainingSeconds: DEFAULT_FOCUS_MINUTES * 60,
  focusMinutes: DEFAULT_FOCUS_MINUTES,
  breakMinutes: DEFAULT_BREAK_MINUTES,
  completedCycles: 0,
  lastTickAt: null
};

function getModeDurationSeconds(mode: FocusTimerMode, state: FocusTimerState) {
  return (mode === "focus" ? state.focusMinutes : state.breakMinutes) * 60;
}

function advanceTimerState(state: FocusTimerState, now: number) {
  if (!state.isRunning || !state.lastTickAt) {
    return state;
  }

  const elapsedSeconds = Math.floor((now - state.lastTickAt) / 1000);
  if (elapsedSeconds <= 0) {
    return state;
  }

  let remainingSeconds = state.remainingSeconds - elapsedSeconds;
  let mode = state.mode;
  let completedCycles = state.completedCycles;
  let completedFocus = false;
  let completedBreak = false;

  while (remainingSeconds <= 0) {
    if (mode === "focus") {
      completedCycles += 1;
      completedFocus = true;
      mode = "break";
      remainingSeconds += getModeDurationSeconds("break", state);
    } else {
      completedBreak = true;
      mode = "focus";
      remainingSeconds += getModeDurationSeconds("focus", state);
    }
  }

  if (completedFocus) {
    notifySuccess("完成一轮专注", `进入 ${state.breakMinutes} 分钟休息时间。`, "pomodoro-focus-complete");
  }

  if (completedBreak) {
    notifyInfo("休息结束", "可以开始下一轮番茄专注。", "pomodoro-break-complete");
  }

  return {
    ...state,
    mode,
    remainingSeconds,
    completedCycles,
    lastTickAt: now
  };
}

export function useFocusTimer() {
  const [timerState, setTimerState] = usePersistentState<FocusTimerState>(localDataKeys.pomodoro, defaultFocusTimerState);

  useEffect(() => {
    if (!timerState.isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimerState((current) => advanceTimerState(current, Date.now()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [setTimerState, timerState.isRunning]);

  const start = () => {
    setTimerState((current) => ({
      ...current,
      isRunning: true,
      lastTickAt: Date.now()
    }));
  };

  const pause = () => {
    setTimerState((current) => {
      const next = advanceTimerState(current, Date.now());
      return {
        ...next,
        isRunning: false,
        lastTickAt: null
      };
    });
  };

  const reset = () => {
    setTimerState((current) => ({
      ...current,
      mode: "focus",
      isRunning: false,
      remainingSeconds: current.focusMinutes * 60,
      lastTickAt: null
    }));
  };

  const skip = () => {
    setTimerState((current) => {
      const nextMode: FocusTimerMode = current.mode === "focus" ? "break" : "focus";
      return {
        ...current,
        mode: nextMode,
        isRunning: false,
        remainingSeconds: getModeDurationSeconds(nextMode, current),
        lastTickAt: null,
        completedCycles: current.mode === "focus" ? current.completedCycles + 1 : current.completedCycles
      };
    });
  };

  const updateDurations = (focusMinutes: number, breakMinutes: number) => {
    const safeFocusMinutes = Math.max(5, Math.min(90, Math.round(focusMinutes)));
    const safeBreakMinutes = Math.max(1, Math.min(30, Math.round(breakMinutes)));

    setTimerState((current) => ({
      ...current,
      focusMinutes: safeFocusMinutes,
      breakMinutes: safeBreakMinutes,
      remainingSeconds: getModeDurationSeconds(current.mode, {
        ...current,
        focusMinutes: safeFocusMinutes,
        breakMinutes: safeBreakMinutes
      }),
      isRunning: false,
      lastTickAt: null
    }));
  };

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timerState.remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timerState.remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timerState.remainingSeconds]);

  return {
    timerState,
    formattedTime,
    totalSeconds: getModeDurationSeconds(timerState.mode, timerState),
    start,
    pause,
    reset,
    skip,
    updateDurations
  };
}
