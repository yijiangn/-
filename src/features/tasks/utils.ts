import type { StudyTask, TaskBucket, TaskFilters, TaskStatus } from "@/features/tasks/types";
import type { SubjectKey } from "@/lib/constants/subjects";
import { subjectMetas } from "@/lib/constants/subjects";

export const taskStatusLabelMap: Record<TaskStatus, string> = {
  not_started: "未开始",
  in_progress: "进行中",
  delayed: "延期",
  completed: "已完成"
};

export const taskBucketLabelMap: Record<TaskBucket, string> = {
  today: "今日任务",
  long_term: "长期任务"
};

export function getTaskStatusClasses(status: TaskStatus) {
  switch (status) {
    case "completed":
      return "border-sage-200 bg-sage-50 text-sage-700";
    case "in_progress":
      return "border-moss-200 bg-moss-50 text-moss-700";
    case "delayed":
      return "border-moss-300 bg-moss-100 text-moss-800";
    default:
      return "border-stone-200 bg-stone-50 text-stone-600";
  }
}

export function normalizeTask(task: StudyTask): StudyTask {
  const progress = Math.max(0, Math.min(100, Math.round(task.progress)));
  const steps = task.steps.length > 0 ? task.steps : ["开始", "进行中", "整理复盘", "完成"];
  const currentStep = resolveCurrentStep(steps, progress, task.status, task.currentStep);

  if (task.status === "completed") {
    return { ...task, steps, currentStep, progress: 100 };
  }

  if (progress === 100) {
    return { ...task, steps, currentStep, progress, status: "completed" };
  }

  if (progress > 0 && task.status === "not_started") {
    return { ...task, steps, currentStep, progress, status: "in_progress" };
  }

  return { ...task, steps, currentStep, progress };
}

function resolveCurrentStep(steps: string[], progress: number, status: TaskStatus, fallback: number) {
  if (steps.length === 0) {
    return 0;
  }

  if (status === "completed" || progress === 100) {
    return steps.length - 1;
  }

  if (status === "not_started" || progress === 0) {
    return 0;
  }

  const derivedIndex = Math.min(steps.length - 1, Math.max(0, Math.round((progress / 100) * (steps.length - 1))));

  if (!Number.isFinite(fallback)) {
    return derivedIndex;
  }

  return Math.min(steps.length - 1, Math.max(0, derivedIndex));
}

export function getTaskStepLabel(task: StudyTask) {
  if (task.steps.length === 0) {
    return "尚未设置任务步骤";
  }

  return `第 ${task.currentStep + 1} / ${task.steps.length} 步：${task.steps[task.currentStep]}`;
}

export function filterTasks(tasks: StudyTask[], filters: TaskFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return tasks
    .filter((task) => {
      if (filters.archiveView === "active" && task.archivedAt) {
        return false;
      }

      if (filters.archiveView === "archived" && !task.archivedAt) {
        return false;
      }

      if (filters.bucket !== "all" && task.bucket !== filters.bucket) {
        return false;
      }

      if (filters.subjectKey !== "all" && task.subjectKey !== filters.subjectKey) {
        return false;
      }

      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [task.title, task.focus, task.note, task.deadlineLabel]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((left, right) => {
      if (left.bucket !== right.bucket) {
        return left.bucket === "today" ? -1 : 1;
      }

      const statusRank: Record<TaskStatus, number> = {
        in_progress: 0,
        delayed: 1,
        not_started: 2,
        completed: 3
      };

      if (statusRank[left.status] !== statusRank[right.status]) {
        return statusRank[left.status] - statusRank[right.status];
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
}

export function buildTaskSections(tasks: StudyTask[]) {
  return (["today", "long_term"] as const)
    .map((bucket) => {
      const bucketTasks = tasks.filter((task) => task.bucket === bucket);
      const groups = subjectMetas
        .map((subject) => ({
          subject,
          tasks: bucketTasks.filter((task) => task.subjectKey === subject.key)
        }))
        .filter((group) => group.tasks.length > 0);

      return {
        bucket,
        groups,
        total: bucketTasks.length
      };
    })
    .filter((section) => section.total > 0);
}

export function calculateTaskOverview(tasks: StudyTask[]) {
  const activeTasks = tasks.filter((task) => !task.archivedAt);
  const todayTasks = activeTasks.filter((task) => task.bucket === "today");
  const longTermTasks = activeTasks.filter((task) => task.bucket === "long_term");
  const completedTasks = activeTasks.filter((task) => task.status === "completed");
  const delayedTasks = activeTasks.filter((task) => task.status === "delayed");
  const totalProgress = activeTasks.reduce((sum, task) => sum + task.progress, 0);

  const subjectCounts = subjectMetas.map((subject) => ({
    subjectKey: subject.key,
    label: subject.label,
    count: activeTasks.filter((task) => task.subjectKey === subject.key).length
  }));

  return {
    totalCount: activeTasks.length,
    todayCount: todayTasks.length,
    longTermCount: longTermTasks.length,
    completedCount: completedTasks.length,
    delayedCount: delayedTasks.length,
    progressPercent: activeTasks.length > 0 ? Math.round(totalProgress / activeTasks.length) : 0,
    subjectCounts
  };
}

export function countTasksBySubject(tasks: StudyTask[], subjectKey: SubjectKey) {
  return tasks.filter((task) => task.subjectKey === subjectKey).length;
}
