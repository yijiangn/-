"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, BellIcon, ClockIcon, CloudIcon, TargetIcon } from "@/components/ui/icons";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask } from "@/features/tasks/types";
import type { FocusTimerState } from "@/hooks/use-focus-timer";
import { cn } from "@/lib/utils";

interface TopbarNotificationMenuProps {
  tasks: StudyTask[];
  mistakes: MistakeRecord[];
  knowledge: KnowledgeRecord[];
  isCloudConnected: boolean;
  timerState: FocusTimerState;
  formattedTime: string;
}

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  route?: string;
  tone: "sage" | "moss" | "amber" | "rose" | "stone";
  icon: "cloud" | "timer" | "task" | "alert";
};

function buildNotifications({
  tasks,
  mistakes,
  knowledge,
  isCloudConnected,
  timerState,
  formattedTime
}: TopbarNotificationMenuProps): NotificationItem[] {
  const activeTasks = tasks.filter((task) => !task.archivedAt);
  const pendingToday = activeTasks.filter((task) => task.bucket === "today" && task.status !== "completed");
  const delayedTasks = activeTasks.filter((task) => task.status === "delayed");
  const importantMistakes = mistakes.filter((record) => !record.archivedAt && record.importance >= 4);
  const importantKnowledge = knowledge.filter((record) => !record.archivedAt && (record.importance ?? 0) >= 4);

  const items: NotificationItem[] = [];

  if (!isCloudConnected) {
    items.push({
      id: "cloud-disconnected",
      title: "云端同步未连接",
      description: "当前仍可使用本地数据。连接账号后会携带 Supabase 用户身份读写。",
      tone: "amber",
      icon: "cloud"
    });
  }

  if (timerState.isRunning) {
    items.push({
      id: "timer-running",
      title: timerState.mode === "focus" ? "番茄专注进行中" : "休息计时进行中",
      description: `${formattedTime} 后进入${timerState.mode === "focus" ? "休息" : "下一轮专注"}。`,
      tone: "moss",
      icon: "timer"
    });
  }

  if (pendingToday.length > 0) {
    items.push({
      id: "today-pending",
      title: `今日还有 ${pendingToday.length} 个任务`,
      description: "建议先处理进行中或延期任务，避免任务堆积。",
      route: "/tasks",
      tone: "sage",
      icon: "task"
    });
  }

  if (delayedTasks.length > 0) {
    items.push({
      id: "delayed-tasks",
      title: `${delayedTasks.length} 个任务已延期`,
      description: "进入任务页重新安排进度或转入长期任务。",
      route: "/tasks",
      tone: "rose",
      icon: "alert"
    });
  }

  if (importantMistakes.length > 0) {
    items.push({
      id: "important-mistakes",
      title: `${importantMistakes.length} 条高优先错题`,
      description: "适合在晚间复盘时集中回看。",
      route: "/mistakes",
      tone: "amber",
      icon: "alert"
    });
  }

  if (importantKnowledge.length > 0) {
    items.push({
      id: "important-knowledge",
      title: `${importantKnowledge.length} 条重点知识点`,
      description: "建议按科目筛选后复习摘要和记忆提示。",
      route: "/knowledge",
      tone: "stone",
      icon: "task"
    });
  }

  return items;
}

function NotificationIcon({ icon }: { icon: NotificationItem["icon"] }) {
  switch (icon) {
    case "cloud":
      return <CloudIcon className="h-4 w-4" />;
    case "timer":
      return <ClockIcon className="h-4 w-4" />;
    case "alert":
      return <AlertTriangleIcon className="h-4 w-4" />;
    default:
      return <TargetIcon className="h-4 w-4" />;
  }
}

const toneClassMap: Record<NotificationItem["tone"], string> = {
  sage: "border-sage-200 bg-sage-50 text-sage-800",
  moss: "border-moss-200 bg-moss-50 text-moss-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  stone: "border-stone-200 bg-stone-50 text-stone-700"
};

export function TopbarNotificationMenu(props: TopbarNotificationMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const notifications = useMemo(() => buildNotifications(props), [props]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="打开通知"
        aria-expanded={open}
        className="relative rounded-xl p-2 text-stone-500 transition hover:bg-white/45 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-700/50"
      >
        <BellIcon className="h-5 w-5" />
        {notifications.length > 0 ? (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-moss-600 px-1 text-[9px] font-black leading-none text-white">
            {notifications.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed right-4 top-[72px] z-[130] w-[360px] rounded-[30px] border border-white/70 bg-white/90 p-3 shadow-float backdrop-blur-2xl lg:right-6">
          <div className="flex items-center justify-between px-2 py-2">
            <div>
              <p className="text-sm font-black text-stone-950">学习提醒</p>
              <p className="mt-1 text-xs text-stone-500">根据任务、重点记录和云端状态生成</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500">
              {notifications.length || "清爽"}
            </span>
          </div>

          <div className="mt-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-stone-700">暂时没有需要处理的提醒</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">任务、重点错题和知识点会在这里汇总。</p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.route) {
                      router.push(item.route);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[24px] border px-3 py-3 text-left transition",
                    toneClassMap[item.tone],
                    item.route ? "hover:bg-white" : "cursor-default"
                  )}
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/75">
                    <NotificationIcon icon={item.icon} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 opacity-75">{item.description}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
