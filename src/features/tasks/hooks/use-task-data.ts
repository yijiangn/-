"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { defaultTaskFilters, initialTasks } from "@/features/tasks/mock-data";
import type { StudyTask, TaskFormValues, TaskStatus } from "@/features/tasks/types";
import { normalizeTask } from "@/features/tasks/utils";
import { localDataKeys, usePersistentCollection } from "@/lib/local-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { notifyError, notifyInfo, notifyUndo } from "@/lib/toast";
import { createTaskInApi, deleteTaskInApi, listTasksFromApi, updateTaskInApi } from "@/services/tasks";

const DEFAULT_IN_PROGRESS_PERCENT = 35;
const DEFAULT_TASK_STEPS = ["开始任务", "处理中", "整理复盘", "完成"];
const DEFAULT_TASK_FOCUS = "待补充任务说明";

function reviveTasks(tasks: StudyTask[]) {
  return tasks.map(normalizeTask);
}

function buildTaskFromFormValues(values: TaskFormValues): StudyTask {
  return normalizeTask({
    id: `task-${Date.now()}`,
    title: values.title.trim(),
    subjectKey: values.subjectKey,
    bucket: values.bucket,
    status: values.status,
    progress: values.progress,
    steps: DEFAULT_TASK_STEPS,
    currentStep: 0,
    focus: values.focus.trim() || DEFAULT_TASK_FOCUS,
    note: values.note.trim() || undefined,
    estimateLabel: values.estimateLabel.trim() || undefined,
    deadlineLabel: values.deadlineLabel.trim() || undefined,
    createdAt: new Date().toISOString(),
    archivedAt: null
  });
}

export function useTaskData() {
  const remoteEnabled = hasSupabaseClientEnv();
  const seedTasks = useMemo(() => initialTasks.map(normalizeTask), []);
  const [tasks, setTasks, tasksState] = usePersistentCollection<StudyTask>(localDataKeys.tasks, {
    seedData: seedTasks,
    revive: reviveTasks,
    hydrateFromLocal: !remoteEnabled
  });
  const tasksRef = useRef(tasks);
  const hasFetched = useRef(false);
  const deleteTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (!tasksState.isReady || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    let mounted = true;

    if (!remoteEnabled) {
      if (!tasksState.hasLocalSnapshot) {
        tasksState.seedCollection();
      }

      return () => {
        mounted = false;
      };
    }

    listTasksFromApi()
      .then((remoteTasks) => {
        if (mounted) {
          setTasks(remoteTasks.map(normalizeTask));
        }
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        if (tasksState.hasLocalSnapshot) {
          tasksState.restoreLocalSnapshot();
        } else {
          tasksState.seedCollection();
        }

        notifyInfo(
          "云端任务暂时不可用",
          "当前先回退到设备上的任务快照，稍后可重新同步。",
          "tasks-load-fallback"
        );
      });

    return () => {
      mounted = false;
    };
  }, [
    remoteEnabled,
    setTasks,
    tasksState.hasLocalSnapshot,
    tasksState.isReady,
    tasksState.restoreLocalSnapshot,
    tasksState.seedCollection
  ]);

  useEffect(() => {
    return () => {
      deleteTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      deleteTimersRef.current.clear();
    };
  }, []);

  const updateTask = useCallback(
    async (taskId: string, updater: (task: StudyTask) => StudyTask) => {
      const currentTask = tasksRef.current.find((task) => task.id === taskId);

      if (!currentTask) {
        return false;
      }

      const previousTasks = tasksRef.current;
      const nextTask = normalizeTask(updater(currentTask));

      setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? nextTask : task)));

      if (!remoteEnabled) {
        return true;
      }

      try {
        const remoteTask = await updateTaskInApi(nextTask);
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskId ? normalizeTask(remoteTask) : task))
        );
        return true;
      } catch {
        setTasks(previousTasks);
        notifyError(
          "任务更新失败",
          "本次修改没有成功同步到云端，已恢复到更新前状态。",
          "task-update-failed"
        );
        return false;
      }
    },
    [remoteEnabled, setTasks]
  );

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) =>
      updateTask(taskId, (task) => ({
        ...task,
        status,
        progress:
          status === "completed"
            ? 100
            : status === "not_started"
              ? 0
              : task.progress === 0 || task.progress === 100
                ? DEFAULT_IN_PROGRESS_PERCENT
                : task.progress
      })),
    [updateTask]
  );

  const updateTaskProgress = useCallback(
    async (taskId: string, progress: number) =>
      updateTask(taskId, (task) => ({
        ...task,
        progress,
        status:
          progress === 100
            ? "completed"
            : progress > 0 && task.status === "not_started"
              ? "in_progress"
              : task.status === "completed" && progress < 100
                ? "in_progress"
                : task.status
      })),
    [updateTask]
  );

  const toggleTaskArchive = useCallback(
    async (taskId: string) =>
      updateTask(taskId, (task) => ({
        ...task,
        archivedAt: task.archivedAt ? null : new Date().toISOString()
      })),
    [updateTask]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const targetTask = tasksRef.current.find((task) => task.id === taskId);

      if (!targetTask) {
        return false;
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

      const undo = () => {
        const timer = deleteTimersRef.current.get(taskId);
        if (timer) {
          window.clearTimeout(timer);
          deleteTimersRef.current.delete(taskId);
        }

        setTasks((currentTasks) =>
          currentTasks.some((task) => task.id === targetTask.id) ? currentTasks : [targetTask, ...currentTasks]
        );
      };

      notifyUndo("任务已删除", "5 秒内可以撤销，本地列表已先移除。", undo, `task-delete-${taskId}`);

      if (!remoteEnabled) {
        return true;
      }

      const timer = window.setTimeout(async () => {
        deleteTimersRef.current.delete(taskId);
        try {
          await deleteTaskInApi(taskId);
        } catch {
          setTasks((currentTasks) =>
            currentTasks.some((task) => task.id === targetTask.id) ? currentTasks : [targetTask, ...currentTasks]
          );
          notifyError(
            "任务删除同步失败",
            "云端删除未完成，任务已恢复到列表中。",
            "task-delete-failed"
          );
        }
      }, 5000);

      deleteTimersRef.current.set(taskId, timer);
      return true;
    },
    [remoteEnabled, setTasks]
  );

  const createTask = useCallback(
    async (values: TaskFormValues) => {
      const createdTask = buildTaskFromFormValues(values);
      const previousTasks = tasksRef.current;

      setTasks((currentTasks) => [createdTask, ...currentTasks]);

      if (!remoteEnabled) {
        return createdTask;
      }

      try {
        const remoteTask = await createTaskInApi(createdTask);
        const normalizedRemoteTask = normalizeTask(remoteTask);

        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === createdTask.id ? normalizedRemoteTask : task))
        );

        return normalizedRemoteTask;
      } catch {
        setTasks(previousTasks);
        notifyError(
          "任务保存失败",
          "任务未能同步到云端，本次创建已回滚。",
          "task-create-failed"
        );
        return null;
      }
    },
    [remoteEnabled, setTasks]
  );

  return {
    tasks,
    defaultFilters: defaultTaskFilters,
    createTask,
    deleteTask,
    updateTaskProgress,
    updateTaskStatus,
    toggleTaskArchive
  };
}
