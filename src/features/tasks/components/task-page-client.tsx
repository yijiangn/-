"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PlusIcon, TargetIcon } from "@/components/ui/icons";
import { LongTermKanban } from "@/features/tasks/components/long-term-kanban";
import { TaskFormModal } from "@/features/tasks/components/task-form-modal";
import { TaskStatsOverview } from "@/features/tasks/components/task-stats-overview";
import { TodayTasksAccordion } from "@/features/tasks/components/today-tasks-accordion";
import { useTaskData } from "@/features/tasks/hooks/use-task-data";
import type { StudyTask } from "@/features/tasks/types";
import { calculateTaskOverview } from "@/features/tasks/utils";
import { subjectMetas } from "@/lib/constants/subjects";

export function TaskPageClient() {
  const { tasks, createTask, deleteTask, toggleTaskArchive, updateTaskProgress, updateTaskStatus } = useTaskData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<StudyTask | null>(null);

  const overview = useMemo(() => calculateTaskOverview(tasks), [tasks]);
  const todayDoneCount = useMemo(
    () => tasks.filter((task) => task.bucket === "today" && !task.archivedAt && task.status === "completed").length,
    [tasks]
  );
  const subjectCounts = useMemo(
    () =>
      subjectMetas.map((subject) => ({
        subjectKey: subject.key,
        count: tasks.filter((task) => !task.archivedAt && task.subjectKey === subject.key).length
      })),
    [tasks]
  );

  const handleCreateTask = async (values: Parameters<typeof createTask>[0]) => {
    await createTask(values);
    setIsCreateOpen(false);
  };

  return (
    <>
      <div className="px-3 py-3 lg:px-4 lg:py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="soft-pill">
                <TargetIcon className="h-3.5 w-3.5" />
                任务管理
              </span>
              <h1 className="text-xl font-black text-stone-950 dark:text-stone-100 sm:text-2xl">
                今日与长期任务
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-moss-700/80 px-4 py-2.5 text-sm font-bold text-white shadow-md backdrop-blur transition hover:bg-moss-600"
            >
              <PlusIcon className="h-4 w-4" />
              新增任务
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <TodayTasksAccordion
              tasks={tasks}
              onStatusChange={updateTaskStatus}
              onProgressChange={updateTaskProgress}
              onArchiveToggle={toggleTaskArchive}
              onDelete={(taskId) => {
                const target = tasks.find((task) => task.id === taskId);
                if (target) {
                  setTaskToDelete(target);
                }
              }}
              onCreate={() => setIsCreateOpen(true)}
            />

            <TaskStatsOverview
              totalCount={overview.totalCount}
              todayCount={overview.todayCount}
              todayDoneCount={todayDoneCount}
              longTermCount={overview.longTermCount}
              completedCount={overview.completedCount}
              delayedCount={overview.delayedCount}
              progressPercent={overview.progressPercent}
              subjectCounts={subjectCounts}
            />
          </div>

          <LongTermKanban
            tasks={tasks}
            onStatusChange={updateTaskStatus}
            onProgressChange={updateTaskProgress}
            onArchiveToggle={toggleTaskArchive}
            onDelete={(taskId) => {
              const target = tasks.find((task) => task.id === taskId);
              if (target) {
                setTaskToDelete(target);
              }
            }}
            onCreate={() => setIsCreateOpen(true)}
          />
        </div>
      </div>

      <TaskFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateTask} />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="删除这个任务？"
        description={taskToDelete ? `将删除「${taskToDelete.title}」。删除后 5 秒内可以撤销。` : undefined}
        confirmLabel="删除"
        tone="danger"
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            void deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
      />
    </>
  );
}
