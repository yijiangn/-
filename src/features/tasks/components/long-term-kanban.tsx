"use client";

import { useState } from "react";
import { ArchiveIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { taskStatusOptions } from "@/features/tasks/mock-data";
import type { StudyTask, TaskStatus } from "@/features/tasks/types";
import { getTaskStatusClasses, taskStatusLabelMap } from "@/features/tasks/utils";
import { subjectMetas } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface LongTermKanbanProps {
  tasks: StudyTask[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onArchiveToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCreate: () => void;
}

export function LongTermKanban({
  tasks,
  onStatusChange,
  onProgressChange,
  onArchiveToggle,
  onDelete,
  onCreate
}: LongTermKanbanProps) {
  const longTermTasks = tasks.filter((task) => task.bucket === "long_term" && !task.archivedAt);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const columns = subjectMetas
    .map((subject) => ({
      subject,
      tasks: longTermTasks.filter((task) => task.subjectKey === subject.key)
    }))
    .filter((column) => column.tasks.length > 0);

  if (longTermTasks.length === 0) {
    return (
      <section className="panel p-6 text-center">
        <p className="text-sm font-black text-stone-950 dark:text-stone-200">还没有长期任务</p>
        <p className="mt-1 text-xs font-bold text-stone-600 dark:text-stone-400">
          长期任务适合承载跨周、跨月推进的系统性学习目标。
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/40 px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-white/70 dark:text-stone-200"
        >
          <PlusIcon className="h-4 w-4" />
          添加长期任务
        </button>
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-stone-950 dark:text-stone-100">长期任务</h2>
          <p className="mt-0.5 text-xs font-bold text-stone-600 dark:text-stone-400">
            {longTermTasks.length} 条 · 按科目分区
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {columns.map(({ subject, tasks: columnTasks }) => (
          <div key={subject.key} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-black", subject.accentSurfaceClass, subject.accentTextClass)}>
                {subject.label}
              </span>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-500">{columnTasks.length} 项</span>
            </div>

            {columnTasks.map((task) => {
              const isExpanded = expandedId === task.id;
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={task.id}
                  className={cn(
                    "panel overflow-hidden border-white/40 bg-white/25 p-0 transition-all dark:border-stone-700/30 dark:bg-stone-900/30",
                    isCompleted && "opacity-65"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : task.id)}
                    className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition hover:bg-white/20 dark:hover:bg-stone-800/20"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        task.status === "completed"
                          ? "bg-sage-500"
                          : task.status === "in_progress"
                            ? "bg-amber-400 shadow-[0_0_4px_1px_rgba(251,191,36,0.5)]"
                            : task.status === "delayed"
                              ? "bg-red-400"
                              : "bg-stone-300"
                      )}
                    />
                    <p className={cn("flex-1 truncate text-xs font-black text-stone-900 dark:text-stone-100", isCompleted && "line-through opacity-70")}>
                      {task.title}
                    </p>
                    <span className="shrink-0 text-[10px] font-black text-stone-500 dark:text-stone-500">{task.progress}%</span>
                  </button>

                  <div className="h-0.5 w-full bg-white/20 dark:bg-stone-700/30">
                    <div className={cn("h-full transition-all duration-500", subject.accentBarClass)} style={{ width: `${task.progress}%` }} />
                  </div>

                  {isExpanded ? (
                    <div className="border-t border-white/20 bg-white/10 px-3.5 py-3 dark:border-stone-700/30 dark:bg-stone-900/15">
                      <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded-lg border px-2.5 py-1 text-[10px] font-black", getTaskStatusClasses(task.status))}>
                          {taskStatusLabelMap[task.status]}
                        </span>
                        {task.deadlineLabel ? (
                          <span className="rounded-lg border border-white/50 bg-white/30 px-2.5 py-1 text-[10px] font-bold text-stone-700 dark:text-stone-300">
                            {task.deadlineLabel}
                          </span>
                        ) : null}
                      </div>

                      {task.focus ? (
                        <p className="mb-3 text-xs font-bold leading-relaxed text-stone-700 dark:text-stone-300">{task.focus}</p>
                      ) : null}

                      <div className="mb-3 space-y-1.5">
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

                      <div className="mb-3 flex flex-wrap gap-1">
                        {taskStatusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => onStatusChange(task.id, option.value)}
                            className={cn(
                              "rounded-lg border px-2 py-1 text-[10px] font-bold transition",
                              task.status === option.value
                                ? getTaskStatusClasses(option.value)
                                : "border-white/40 bg-white/20 text-stone-600 hover:bg-white/40 dark:text-stone-400"
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
                          className="flex items-center gap-1 rounded-lg border border-white/40 bg-white/20 px-2.5 py-1.5 text-[10px] font-bold text-stone-700 transition hover:bg-white/40 dark:text-stone-300"
                        >
                          <ArchiveIcon className="h-3 w-3" />
                          归档
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(task.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200/60 bg-red-50/40 px-2.5 py-1.5 text-[10px] font-bold text-red-700 transition hover:bg-red-100/60 dark:text-red-400"
                        >
                          <TrashIcon className="h-3 w-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
