"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  SearchIcon,
  SnowflakeIcon,
  SparklesIcon,
  SunIcon,
  TargetIcon
} from "@/components/ui/icons";
import { FocusTimerWidget } from "@/components/layout/focus-timer-widget";
import { QuickSearchDialog } from "@/components/layout/quick-search-dialog";
import { TopbarNotificationMenu } from "@/components/layout/topbar-notification-menu";
import { TopbarUserMenu } from "@/components/layout/topbar-user-menu";
import { AdminMenu } from "@/components/layout/admin-menu";
import { examInfo } from "@/features/home/mock-data";
import { useWeather } from "@/features/home/hooks/use-weather";
import { calculateDaysUntil } from "@/features/home/utils/date";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useFocusTimer } from "@/hooks/use-focus-timer";
import { useTopbarCollections } from "@/hooks/use-topbar-collections";
import { cn } from "@/lib/utils";

const studyTips = [
  "番茄工作法：25 分钟专注 + 5 分钟休息，循环叠加。",
  "间隔重复：在遗忘即将发生前回看，效率更高。",
  "错题复盘：先写错因，再写下次如何避开。",
  "知识沉淀：标题要可搜索，标签要少而准。"
];

function formatBannerDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function getTodayPercent(now: Date) {
  const minutesElapsed = now.getHours() * 60 + now.getMinutes();
  return Math.round((minutesElapsed / 1440) * 100);
}

function getMonthPercent(now: Date) {
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayFraction = (now.getHours() * 60 + now.getMinutes()) / 1440;
  const elapsed = now.getDate() - 1 + dayFraction;
  return Math.round((elapsed / totalDays) * 100);
}

function MiniProgress({ label, value, tone }: { label: string; value: number; tone: "sage" | "moss" | "amber" | "rose" }) {
  const colorClass =
    tone === "rose"
      ? "text-rose-500"
      : tone === "amber"
        ? "text-amber-500"
        : tone === "moss"
          ? "text-moss-600"
          : "text-sage-600";

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-4 w-4">
        <svg className="h-4 w-4 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-stone-200/60" />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={cn(colorClass, "transition-all duration-500")}
            strokeDasharray={`${value * 0.5027} 50.27`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-[10px] font-bold text-sage-900/70">{label}</span>
      <span className={cn("text-xs font-black tabular-nums", colorClass)}>{value}%</span>
    </div>
  );
}

function WeatherIcon({ condition }: { condition?: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" }) {
  if (condition === "cloudy") {
    return <CloudIcon className="h-3.5 w-3.5 text-stone-400" />;
  }

  if (condition === "rainy") {
    return <CloudRainIcon className="h-3.5 w-3.5 text-sky-500" />;
  }

  if (condition === "snowy") {
    return <SnowflakeIcon className="h-3.5 w-3.5 text-sky-400" />;
  }

  if (condition === "stormy") {
    return <CloudLightningIcon className="h-3.5 w-3.5 text-amber-500" />;
  }

  return <SunIcon className="h-3.5 w-3.5 text-amber-500" />;
}

export function TopBar() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const daysLeft = calculateDaysUntil(examInfo.targetDate);
  const { weather } = useWeather();
  const collections = useTopbarCollections();
  const authSession = useAuthSession();
  const focusTimer = useFocusTimer();

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuickSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const todayPercent = now ? getTodayPercent(now) : 0;
  const monthPercent = now ? getMonthPercent(now) : 0;
  const dailyTip = useMemo(() => {
    if (!now) {
      return studyTips[0];
    }

    if (focusTimer.timerState.isRunning) {
      return focusTimer.timerState.mode === "focus"
        ? `番茄专注中：${focusTimer.formattedTime} 后进入休息。`
        : `休息计时中：${focusTimer.formattedTime} 后开始下一轮。`;
    }

    return studyTips[now.getDate() % studyTips.length];
  }, [focusTimer.formattedTime, focusTimer.timerState.isRunning, focusTimer.timerState.mode, now]);

  if (!mounted || !now) {
    return <div className="sticky top-0 z-50 h-[100px]" />;
  }

  const todayTone = todayPercent < 55 ? "sage" : todayPercent < 90 ? "amber" : "rose";
  const monthTone = monthPercent < 75 ? "moss" : monthPercent < 90 ? "amber" : "rose";

  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex flex-col transition-all duration-300",
        isScrolled ? "border-b border-white/20 bg-white/10 pb-2 backdrop-blur-md dark:border-stone-800/40 dark:bg-stone-950/40" : ""
      )}
    >
      <header className="flex h-[60px] items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center lg:w-1/4">
          <button
            type="button"
            onClick={() => setQuickSearchOpen(true)}
            className="group flex w-full max-w-[300px] items-center justify-between gap-2.5 rounded-xl border border-white/45 bg-white/25 px-3 py-2 text-sm text-stone-500 shadow-xl backdrop-blur-md transition hover:border-white/70 hover:bg-white/40"
            aria-label="打开全局快速搜索"
          >
            <span className="flex min-w-0 items-center gap-2">
              <SearchIcon className="h-4 w-4 shrink-0 text-stone-500 transition group-hover:text-moss-700" />
              <span className="truncate text-xs font-medium text-stone-600">搜索任务、错题、知识点...</span>
            </span>
            <kbd className="hidden items-center gap-0.5 rounded-md bg-stone-900/10 px-1.5 py-0.5 text-[10px] font-bold text-stone-700 shadow-sm transition group-hover:bg-white/50 lg:inline-flex">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-3 rounded-full border border-white/45 bg-white/30 px-4 py-1.5 shadow-[0_8px_32px_rgba(31,38,135,0.08)] backdrop-blur-2xl transition hover:bg-white/40">
            <TargetIcon className="h-4 w-4 text-sage-600" />
            <span className="text-xs font-medium text-sage-700">考研倒计时</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-serif text-lg font-black leading-none tabular-nums text-stone-950">{daysLeft}</span>
              <span className="text-[10px] font-bold text-stone-700">天</span>
            </div>
            <div className="h-4 w-px bg-stone-300/60" />
            <MiniProgress label="今日" value={todayPercent} tone={todayTone} />
            <MiniProgress label="本月" value={monthPercent} tone={monthTone} />
            <div className="h-4 w-px bg-stone-300/60" />
            <FocusTimerWidget {...focusTimer} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:w-1/4">
          <div className="lg:hidden">
            <FocusTimerWidget {...focusTimer} />
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/45 bg-white/25 p-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-stone-800/40">
            <TopbarNotificationMenu
              tasks={collections.tasks}
              mistakes={collections.mistakes}
              knowledge={collections.knowledge}
              isCloudConnected={authSession.isConnected}
              timerState={focusTimer.timerState}
              formattedTime={focusTimer.formattedTime}
            />
            <TopbarUserMenu {...authSession} />
            <AdminMenu />
          </div>
        </div>
      </header>

      <div className="mx-4 mt-2 hidden h-[38px] items-center justify-between rounded-2xl border border-white/35 bg-sage-50/65 px-5 text-sage-900 shadow-xl backdrop-blur-md transition hover:bg-sage-50/85 lg:mx-6 lg:flex">
        <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
          <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-sage-800" />
          <div className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
            <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-sage-900/60">今日格言</span>
            <span className="truncate text-[13px] font-bold tracking-wide text-stone-900">{dailyTip}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] opacity-75 transition-opacity hover:opacity-100">
          <span className="font-medium tracking-tight">{formatBannerDate(now)}</span>
          <div className="h-3 w-px bg-current opacity-20" />
          <div className="flex items-center gap-2.5">
            <span className="opacity-90">{weather?.location || "当前位置"}</span>
            <div className="flex items-center gap-1.5">
              <WeatherIcon condition={weather?.condition} />
              <span className="font-bold">{weather?.temp ?? "--"}°C</span>
            </div>
          </div>
        </div>
      </div>

      <QuickSearchDialog
        open={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        tasks={collections.tasks}
        mistakes={collections.mistakes}
        knowledge={collections.knowledge}
      />
    </div>
  );
}
