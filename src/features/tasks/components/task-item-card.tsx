import { ArchiveIcon, ClockIcon, TrashIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { taskStatusOptions } from "@/features/tasks/mock-data";
import type { StudyTask, TaskStatus } from "@/features/tasks/types";
import { getTaskStatusClasses, getTaskStepLabel, taskStatusLabelMap } from "@/features/tasks/utils";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface TaskItemCardProps {
  task: StudyTask;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onArchiveToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItemCard({
  task,
  isSelected,
  onSelect,
  onStatusChange,
  onArchiveToggle,
  onDelete
}: TaskItemCardProps) {
  const subject = subjectMetaMap[task.subjectKey];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(task.id);
        }
      }}
      className={cn(
        "panel border p-4 transition duration-200",
        isSelected ? "border-sage-400 ring-2 ring-sage-200 bg-white/60 dark:bg-stone-800/80" : "border-white/40 bg-white/30 hover:bg-white/50 dark:border-stone-700/30 dark:bg-stone-800/30 dark:hover:bg-stone-800/50",
        task.archivedAt && "opacity-75"
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", subject.accentSurfaceClass, subject.accentTextClass)}>
            {subject.label}
          </span>
          <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", getTaskStatusClasses(task.status))}>
            {taskStatusLabelMap[task.status]}
          </span>
          {task.archivedAt ? (
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500">
              已归档
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-base font-black text-stone-950 sm:text-lg dark:text-stone-100">{task.title}</h3>
        <p className="mt-2 text-sm leading-6 font-bold text-stone-700 dark:text-stone-300">{task.focus}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-stone-500">
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          {task.estimateLabel || "未设置时长"}
        </span>
        <span>{task.progress}%</span>
      </div>

      <ProgressBar value={task.progress} className="mt-3" />
      <p className="mt-2 text-xs font-bold leading-5 text-stone-700 dark:text-stone-400">当前步骤：{getTaskStepLabel(task)}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={task.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
          className="w-full rounded-2xl border border-white/60 bg-white/40 px-3 py-2 text-sm font-bold text-stone-900 shadow-sm outline-none transition focus:border-sage-400 sm:w-auto dark:border-stone-600/50 dark:bg-stone-900/50 dark:text-stone-200"
        >
          {taskStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onArchiveToggle(task.id);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/30 px-3 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-white/60 dark:border-stone-600/50 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            <ArchiveIcon className="h-4 w-4" />
            {task.archivedAt ? "取消归档" : "归档"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task.id);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200/60 bg-red-50/40 px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            <TrashIcon className="h-4 w-4" />
            删除
          </button>
        </div>
      </div>
    </article>
  );
}
