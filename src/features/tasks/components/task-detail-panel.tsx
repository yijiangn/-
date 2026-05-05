import { ArchiveIcon, ClockIcon, TrashIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { taskStatusOptions } from "@/features/tasks/mock-data";
import type { StudyTask, TaskStatus } from "@/features/tasks/types";
import { getTaskStatusClasses, getTaskStepLabel, taskBucketLabelMap, taskStatusLabelMap } from "@/features/tasks/utils";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
  task: StudyTask | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onProgressChange: (taskId: string, progress: number) => void;
  onArchiveToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailPanel({
  task,
  onStatusChange,
  onProgressChange,
  onArchiveToggle,
  onDelete
}: TaskDetailPanelProps) {
  if (!task) {
    return (
      <SectionCard title="任务详情" subtitle="选中一条任务后在这里查看和管理" className="h-full">
        <div className="panel border-dashed p-10 text-center">
          <p className="text-base font-bold text-stone-950 dark:text-stone-200">还没有选中任务</p>
          <p className="mt-2 text-sm leading-6 font-medium text-stone-700 dark:text-stone-400">点击左侧任务卡片，这里会显示状态、进度、步骤和备注。</p>
        </div>
      </SectionCard>
    );
  }

  const subject = subjectMetaMap[task.subjectKey];

  return (
    <SectionCard title="任务详情" subtitle="平板和电脑端适合在这里做精细管理" className="h-full">
      <div className="space-y-5">
        <div className="panel border-white/50 bg-white/40 p-5 dark:border-stone-700/40 dark:bg-stone-900/40">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", subject.accentSurfaceClass, subject.accentTextClass)}>
              {subject.label}
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
              {taskBucketLabelMap[task.bucket]}
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

          <h2 className="mt-4 text-2xl font-black leading-tight text-stone-950 dark:text-stone-100">{task.title}</h2>
          <p className="mt-3 text-sm leading-7 font-bold text-stone-700 dark:text-stone-300">{task.focus}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/50 p-4 dark:border-stone-700/50 dark:bg-stone-800/50">
              <p className="text-xs font-bold text-stone-600 dark:text-stone-400">预计时长</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-black text-stone-950 dark:text-stone-200">
                <ClockIcon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                {task.estimateLabel || "未设置"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/50 p-4 dark:border-stone-700/50 dark:bg-stone-800/50">
              <p className="text-xs font-bold text-stone-600 dark:text-stone-400">截止提示</p>
              <p className="mt-2 text-sm font-black text-stone-950 dark:text-stone-200">{task.deadlineLabel || "未设置"}</p>
            </div>
          </div>
        </div>

        <div className="panel border-white/50 bg-white/40 p-5 dark:border-stone-700/40 dark:bg-stone-900/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-stone-950 dark:text-stone-200">任务状态</p>
            <span className="text-sm font-bold text-stone-600 dark:text-stone-400">当前：{taskStatusLabelMap[task.status]}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {taskStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(task.id, option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  task.status === option.value
                    ? getTaskStatusClasses(option.value)
                    : "border-white/60 bg-white/50 text-stone-700 hover:bg-white/80 dark:border-stone-600/50 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel border-white/50 bg-white/40 p-5 dark:border-stone-700/40 dark:bg-stone-900/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-stone-950 dark:text-stone-200">任务进度</p>
            <span className="text-sm font-bold text-stone-600 dark:text-stone-400">{task.progress}%</span>
          </div>
          <ProgressBar value={task.progress} className="mt-4" />
          <p className="mt-3 text-sm font-medium text-stone-700">{getTaskStepLabel(task)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {task.steps.map((step, index) => {
              const isActive = index === task.currentStep;
              const isCompleted = index < task.currentStep || task.status === "completed";

              return (
                <span
                  key={step}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                    isActive
                      ? "border-sage-400 bg-sage-100 text-sage-800 dark:bg-sage-900/50 dark:text-sage-300"
                      : isCompleted
                        ? "border-moss-300 bg-moss-50 text-moss-800 dark:bg-moss-900/50 dark:text-moss-300"
                        : "border-white/60 bg-white/50 text-stone-600 dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-400"
                  )}
                >
                  {index + 1}. {step}
                </span>
              );
            })}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={task.progress}
            onChange={(event) => onProgressChange(task.id, Number(event.target.value))}
            className="mt-4 w-full accent-sage-600"
          />
          <p className="mt-2 text-xs leading-5 text-stone-500">进度滑到 100% 会自动切换为“已完成”；从 0 往上调整会自动切到“进行中”。</p>
        </div>

        <div className="panel border-white/50 bg-white/40 p-5 dark:border-stone-700/40 dark:bg-stone-900/40">
          <p className="text-sm font-black text-stone-950 dark:text-stone-200">任务备注</p>
          <p className="mt-3 text-sm leading-7 font-bold text-stone-700 dark:text-stone-300">{task.note || "暂无备注，可后续补充执行细节和注意事项。"}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onArchiveToggle(task.id)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/40 px-4 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-white/70 dark:border-stone-600/50 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-700/50"
          >
            <ArchiveIcon className="h-4 w-4" />
            {task.archivedAt ? "取消归档" : "归档任务"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200/60 bg-red-50/50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <TrashIcon className="h-4 w-4" />
            删除任务
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
