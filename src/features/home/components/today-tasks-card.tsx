"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  PlusIcon
} from "@/components/ui/icons";
import { SectionCard } from "@/components/ui/section-card";
import type { StudyTask } from "@/features/tasks/types";
import {
  buildCalendar,
  formatLongDate,
  formatMonthLabel,
  weekHeaders
} from "@/features/home/utils/date";
import { cn } from "@/lib/utils";

interface TodayTasksCardProps {
  tasks: StudyTask[];
  referenceDate?: Date;
  attendance?: string[];
  onToggleAttendance?: (dateKey: string) => void;
}

export function TodayTasksCard({ 
  tasks, 
  referenceDate: initialDate,
  attendance = [],
  onToggleAttendance
}: TodayTasksCardProps) {
  const [mounted, setMounted] = useState(false);
  const [referenceDate, setReferenceDate] = useState<Date | null>(initialDate || null);

  useEffect(() => {
    setMounted(true);
    if (!initialDate) setReferenceDate(new Date());
  }, [initialDate]);

  if (!mounted || !referenceDate) {
    return (
      <SectionCard title="今日任务">
        <div className="flex min-h-[400px] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
        </div>
      </SectionCard>
    );
  }

  const calendarCells = buildCalendar(referenceDate);
  const todayTasks = tasks
    .filter((task) => task.bucket === "today" && !task.archivedAt)
    .slice(0, 5);

  const getProgressBarColor = (progress: number, isCompleted: boolean) => {
    if (progress === 0 && !isCompleted) return "bg-stone-200";
    if (isCompleted || progress === 100) return "bg-sage-500";
    return "bg-blue-500";
  };

  return (
    <SectionCard
      title="今日任务"
      action={
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 rounded-full bg-sage-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sage-700"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          新建任务
        </Link>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-[220px_1fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-black tracking-tight text-stone-950 dark:text-stone-200">{formatLongDate(referenceDate)}</span>
            <ChevronRightIcon className="h-4 w-4 text-stone-400" />
          </div>

          <div className="mb-4 flex items-center justify-between px-1">
            <ChevronLeftIcon className="h-4 w-4 text-stone-400" />
            <span className="text-sm font-black text-stone-950 dark:text-stone-200">{formatMonthLabel(referenceDate)}</span>
            <ChevronRightIcon className="h-4 w-4 text-stone-400" />
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-black text-stone-950 dark:text-stone-200">
            {weekHeaders.map((day) => (
              <div key={day}>{day}</div>
            ))}
            {calendarCells.map((cell, idx) => {
              const cellDate = new Date(cell.iso);
              const dateKey = cell.iso.split("T")[0];
              const todayKey = new Date().toISOString().split("T")[0];
              const isStudied = attendance.includes(dateKey);
              const isFuture = dateKey > todayKey;
              
              const isPrevStudied = attendance.includes(
                new Date(cellDate.getTime() - 86400000).toISOString().split("T")[0]
              );
              const isNextStudied = attendance.includes(
                new Date(cellDate.getTime() + 86400000).toISOString().split("T")[0]
              );

              // 只有在同一行且连续时才视觉相连
              const isFirstInRow = idx % 7 === 0;
              const isLastInRow = idx % 7 === 6;

              const hasTask = tasks.some(
                (t) =>
                  !t.archivedAt &&
                  new Date(t.createdAt).toDateString() === cellDate.toDateString()
              );

              return (
                <button
                  key={idx}
                  onClick={() => !isFuture && onToggleAttendance?.(dateKey)}
                  disabled={isFuture}
                  className={cn(
                    "relative flex h-7 items-center justify-center text-[11px] transition-all",
                    !cell.isCurrentMonth && "opacity-35",
                    isFuture && "cursor-not-allowed opacity-20",
                    isStudied
                      ? "bg-sage-600 font-black text-white shadow-md z-10"
                      : cell.isToday 
                        ? "border-2 border-sage-500 font-black text-sage-700 rounded-lg"
                        : "text-stone-950 font-black dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg",
                    // 连线逻辑
                    isStudied && !isPrevStudied && !isFirstInRow ? "rounded-l-lg" : "",
                    isStudied && !isNextStudied && !isLastInRow ? "rounded-r-lg" : "",
                    isStudied && isFirstInRow ? "rounded-l-lg" : "",
                    isStudied && isLastInRow ? "rounded-r-lg" : "",
                    isStudied && isPrevStudied && isNextStudied && !isFirstInRow && !isLastInRow ? "rounded-none" : "",
                    // 边缘兜底
                    isStudied && isPrevStudied && !isFirstInRow && !isNextStudied && !isLastInRow ? "rounded-r-lg" : "",
                    isStudied && isNextStudied && !isLastInRow && !isPrevStudied && !isFirstInRow ? "rounded-l-lg" : ""
                  )}
                >
                  {cell.value}
                  {hasTask && !isStudied && (
                    <div className="absolute bottom-1 h-1 w-1 rounded-full bg-sage-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-sage-500" />
            <h3 className="text-sm font-bold tracking-tight text-stone-800 dark:text-stone-200">待办事项</h3>
          </div>

          <div className="flex flex-col gap-3">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 py-12 dark:border-stone-700">
                <p className="text-sm text-stone-400">今天暂时没有待办任务</p>
              </div>
            ) : (
              todayTasks.map((task) => {
                const isCompleted = task.status === "completed" || task.progress === 100;

                return (
                  <div
                    key={task.id}
                    className="group relative flex items-center gap-4 panel p-4 hover:bg-white/40 dark:hover:bg-stone-800/40"
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isCompleted
                          ? "border-sage-500 bg-sage-500 text-white shadow-sm"
                          : "border-stone-200 bg-transparent group-hover:border-sage-400 dark:border-stone-700"
                      )}
                    >
                      {isCompleted && <CheckIcon className="h-3.5 w-3.5" />}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-4">
                        <h4
                          className={cn(
                            "truncate text-sm font-bold text-stone-950 transition-all dark:text-stone-100",
                            isCompleted && "text-stone-500 line-through decoration-stone-400"
                          )}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button className="rounded-lg p-1 text-stone-400 hover:bg-sage-100 hover:text-sage-600">
                            <EditIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800/50">
                          <div
                            className={cn("h-full transition-all duration-700", getProgressBarColor(task.progress || 0, isCompleted))}
                            style={{ width: `${isCompleted ? 100 : task.progress || 0}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[10px] font-black tabular-nums text-stone-700 dark:text-stone-300">
                          {isCompleted ? "100" : task.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function getTodayTaskProgressPercent(tasks: StudyTask[]) {
  const todayTasks = tasks.filter((t) => t.bucket === "today" && !t.archivedAt);
  if (todayTasks.length === 0) return 0;
  const completedCount = todayTasks.filter((t) => t.status === "completed" || t.progress === 100).length;
  return Math.round((completedCount / todayTasks.length) * 100);
}
