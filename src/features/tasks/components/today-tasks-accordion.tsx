"use client";

import { useEffect, useState } from "react";
import { ArchiveIcon, ChevronDownIcon, ClockIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { taskStatusOptions } from "@/features/tasks/mock-data";
import type { StudyTask, TaskStatus } from "@/features/tasks/types";
import { getTaskStatusClasses, getTaskStepLabel, isVisibleInToday } from "@/features/tasks/utils";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface TodayTasksAccordionProps {
  tasks: StudyTask[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onArchiveToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCreate: () => void;
}

export function TodayTasksAccordion({
  tasks,
  onStatusChange,
  onProgressChange,
  onArchiveToggle,
  onDelete,
  onCreate
}: TodayTasksAccordionProps) {
  const todayTasks = tasks.filter(isVisibleInToday);
  const completedCount = todayTasks.filter((task) => task.status === "completed").length;
  const defaultOpen =
    todayTasks.find((task) => task.status === "in_progress")?.id ??
    todayTasks.find((task) => task.status !== "completed")?.id ??
    null;
  const [openId, setOpenId] = useState<string | null>(defaultOpen);

  useEffect(() => {
    if (openId && todayTasks.some((task) => task.id === openId)) {
      return;
    }

    setOpenId(defaultOpen);
  }, [defaultOpen, openId, todayTasks]);

  return (
    <section className="panel flex flex-col gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-black text-stone-950 dark:text-stone-100">今日任务</h2>
          <p className="mt-0.5 text-xs font-bold text-stone-600 dark:text-stone-400">
            已完成 {completedCount} / {todayTasks.length} 项
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/40 px-3 py-1.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-white/70 dark:border-stone-700/50 dark:bg-stone-800/40 dark:text-stone-200"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          新增
        </button>
      </div>

      <div className="mx-5 mb-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30 dark:bg-stone-700/40">
          <div
            className="h-full rounded-full bg-sage-500 transition-all duration-500"
            style={{ width: todayTasks.length > 0 ? `${Math.round((completedCount / todayTasks.length) * 100)}%` : "0%" }}
          />
        </div>
      </div>

      {todayTasks.length === 0 ? (
        <div className="px-5 pb-5 text-center">
          <p className="text-sm font-bold text-stone-600 dark:text-stone-400">今日还没有任务</p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-3 rounded-xl border border-white/60 bg-white/40 px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-white/70 dark:text-stone-200"
          >
            添加第一条今日任务
          </button>
        </div>
      ) : null}

      <div className="divide-y divide-white/20 dark:divide-stone-700/30">
        {todayTasks.map((task) => {
          const subject = subjectMetaMap[task.subjectKey];
          const isOpen = openId === task.id;
          const isCompleted = task.status === "completed";

          return (
            <div key={task.id} className={cn("transition-colors", isCompleted && "opacity-70")}>
              <div className="flex w-full items-center px-2 py-2 transition hover:bg-white/20 dark:hover:bg-stone-800/30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newStatus = task.status === "completed" ? "not_started" : "completed";
                    onStatusChange(task.id, newStatus);
                    if (newStatus === "completed") {
                      onProgressChange(task.id, 100);
                    }
                  }}
                  className="flex shrink-0 items-center justify-center p-3 transition-transform hover:scale-110 active:scale-95"
                  aria-label={isCompleted ? "标为未完成" : "标为完成"}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                      isCompleted
                        ? "border-sage-500 bg-sage-500 text-white"
                        : task.status === "in_progress"
                          ? "border-amber-400 bg-transparent"
                          : task.status === "delayed"
                            ? "border-red-400 bg-transparent"
                            : "border-stone-300 bg-transparent dark:border-stone-600"
                    )}
                  >
                    {isCompleted && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setOpenId((current) => (current === task.id ? null : task.id))}
                  className="flex flex-1 items-center gap-3 py-2 pr-3 text-left"
                >
                  <span className={cn("shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-black", subject.accentSurfaceClass, subject.accentTextClass)}>
                    {subject.label}
                  </span>
                  <span className={cn("flex-1 truncate text-sm font-black text-stone-950 transition-all dark:text-stone-100", isCompleted && "text-stone-400 line-through dark:text-stone-500")}>
                    {task.title}
                  </span>
                  <span className="shrink-0 text-xs font-black text-stone-600 dark:text-stone-400">{task.progress}%</span>
                  <ChevronDownIcon className={cn("h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
              </div>

              {isOpen ? (
                <div className="border-t border-white/20 bg-white/10 px-5 py-4 dark:border-stone-700/30 dark:bg-stone-900/20">
                  {task.focus ? (
                    <p className="mb-4 text-sm font-bold text-stone-700 dark:text-stone-300">{task.focus}</p>
                  ) : null}

                  <p className="mb-2 text-xs font-black text-stone-600 dark:text-stone-400">
                    当前步骤：{getTaskStepLabel(task)}
                  </p>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400">进度</span>
                      <span className="text-xs font-black text-stone-900 dark:text-stone-200">{task.progress}%</span>
                    </div>
                    <ProgressBar value={task.progress} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={task.progress}
                      onChange={(event) => onProgressChange(task.id, Number(event.target.value))}
                      className="w-full accent-sage-600"
                    />
                  </div>

                  {(task.estimateLabel || task.deadlineLabel) ? (
                    <div className="mb-4 flex flex-wrap gap-3">
                      {task.estimateLabel ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/30 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {task.estimateLabel}
                        </span>
                      ) : null}
                      {task.deadlineLabel ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/30 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                          截止：{task.deadlineLabel}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {taskStatusOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onStatusChange(task.id, option.value)}
                          className={cn(
                            "rounded-xl border px-3 py-1.5 text-xs font-bold transition",
                            task.status === option.value
                              ? getTaskStatusClasses(option.value)
                              : "border-white/50 bg-white/30 text-stone-600 hover:bg-white/50 dark:border-stone-700/50 dark:bg-stone-800/40 dark:text-stone-400"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onArchiveToggle(task.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/30 px-3 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-white/50 dark:text-stone-300"
                      >
                        <ArchiveIcon className="h-3.5 w-3.5" />
                        归档
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200/60 bg-red-50/40 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100/60 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
