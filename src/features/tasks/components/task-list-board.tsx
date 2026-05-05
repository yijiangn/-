import { SectionCard } from "@/components/ui/section-card";
import { TaskItemCard } from "@/features/tasks/components/task-item-card";
import type { StudyTask, TaskStatus } from "@/features/tasks/types";
import { buildTaskSections, taskBucketLabelMap } from "@/features/tasks/utils";

interface TaskListBoardProps {
  tasks: StudyTask[];
  selectedTaskId: string | null;
  onSelect: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onArchiveToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCreate: () => void;
}

export function TaskListBoard({
  tasks,
  selectedTaskId,
  onSelect,
  onStatusChange,
  onArchiveToggle,
  onDelete,
  onCreate
}: TaskListBoardProps) {
  const sections = buildTaskSections(tasks);

  return (
    <SectionCard
      title="任务列表"
      subtitle="按今日任务和长期任务分区，区内再按科目分组"
      action={
        <button
          type="button"
          onClick={onCreate}
          className="rounded-full border border-white/60 bg-white/50 px-4 py-2 text-sm font-bold text-stone-900 shadow-sm backdrop-blur transition hover:bg-white/70 dark:border-stone-600/50 dark:bg-stone-800/50 dark:text-stone-100 dark:hover:bg-stone-700/60"
        >
          新增任务
        </button>
      }
      className="h-full"
    >
      {sections.length === 0 ? (
        <div className="panel border-dashed p-10 text-center">
          <p className="text-base font-bold text-stone-900 dark:text-stone-200">当前筛选条件下没有任务</p>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">可以重置筛选，或新增一条今天就能执行的任务。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.bucket} className="space-y-4">
              <div className="flex items-center justify-between gap-3 panel border-white/60 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-stone-900/40">
                <div>
                  <h3 className="text-lg font-black text-stone-950 dark:text-stone-100">{taskBucketLabelMap[section.bucket]}</h3>
                  <p className="text-sm font-bold text-stone-600 dark:text-stone-400">共 {section.total} 项</p>
                </div>
              </div>

              <div className="space-y-5">
                {section.groups.map((group) => (
                  <div key={group.subject.key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${group.subject.accentSurfaceClass} ${group.subject.accentTextClass}`}>
                        {group.subject.label}
                      </span>
                      <span className="text-sm text-stone-500">{group.tasks.length} 项</span>
                    </div>
                    <div className="space-y-3">
                      {group.tasks.map((task) => (
                        <TaskItemCard
                          key={task.id}
                          task={task}
                          isSelected={selectedTaskId === task.id}
                          onSelect={onSelect}
                          onStatusChange={onStatusChange}
                          onArchiveToggle={onArchiveToggle}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
