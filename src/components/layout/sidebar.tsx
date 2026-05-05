"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  MoonIcon,
  NoteIcon,
  SunIcon,
  TargetIcon,
  TrendIcon,
  SettingsIcon
} from "@/components/ui/icons";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: HomeIcon, label: "总览" },
  { href: "/tasks", icon: TargetIcon, label: "任务" },
  { href: "/mistakes", icon: NoteIcon, label: "错题" },
  { href: "/knowledge", icon: LayersIcon, label: "知识" },
  { href: "/stats", icon: TrendIcon, label: "统计" },
  { href: "/data", icon: FileTextIcon, label: "数据" },
  { href: "/settings", icon: SettingsIcon, label: "设置" }
];

export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[88px] flex-col items-center py-6 lg:flex">
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
          <BookIcon className="h-5 w-5" />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "group relative flex w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2.5 transition-all duration-300 ease-out",
                  isActive
                    ? "bg-sage-100/80 text-sage-800 dark:bg-sage-900/40 dark:text-sage-400 shadow-sm"
                    : "text-stone-400 hover:bg-stone-100/50 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-800/50 dark:hover:text-stone-300"
                )}
              >
                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-sage-600 transition-all duration-500 dark:bg-sage-400" 
                    style={{ viewTransitionName: 'sidebar-active-indicator' } as any}
                  />
                )}
                <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2.25} />
                <span className={cn("text-[10px] font-black leading-none transition-all", isActive ? "text-sage-900 opacity-100 dark:text-sage-400" : "text-stone-900/80 opacity-80 group-hover:opacity-100 dark:text-stone-300 group-hover:text-stone-950 dark:group-hover:text-white")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 底部：模式切换 */}
        <div className="mt-auto flex flex-col items-center pb-2">
          <button
            type="button"
            aria-label={theme === "dark" ? "切换到白天模式" : "切换到夜晚模式"}
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-stone-400 transition-all duration-300 hover:bg-stone-100/50 hover:text-amber-500 hover:rotate-12 dark:text-stone-500 dark:hover:bg-stone-800/50 dark:hover:text-amber-400"
          >
            {mounted ? (
              theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
            )}
          </button>
        </div>
      </aside>

      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200/40 bg-white/80 px-2 py-1 backdrop-blur-xl dark:border-stone-700/30 dark:bg-stone-900/80 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                isActive ? "text-sage-700 dark:text-sage-400" : "text-stone-400 dark:text-stone-500"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
