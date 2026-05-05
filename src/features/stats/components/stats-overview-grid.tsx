import type { StatsOverview } from "@/features/stats/types";

interface StatsOverviewGridProps {
  overview: StatsOverview;
}

export function StatsOverviewGrid({ overview }: StatsOverviewGridProps) {
  const items = [
    {
      label: "14天完成任务",
      value: overview.recentCompletedTasks,
      helper: "执行层推进情况",
      accent: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-900/40"
    },
    {
      label: "14天新增记录",
      value: overview.recentStudyRecords,
      helper: "错题与知识点合计",
      accent: "text-sky-700 dark:text-sky-400",
      bg: "bg-sky-50/50 dark:bg-sky-900/20 border-sky-200/60 dark:border-sky-900/40"
    },
    {
      label: "连续活跃",
      value: `${overview.currentStreak} 天`,
      helper: `历史最佳 ${overview.bestStreak} 天`,
      accent: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50/50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-900/40"
    },
    {
      label: "平均活跃度",
      value: overview.recentAverageScore,
      helper: "任务×2 + 记录×1",
      accent: "text-violet-700 dark:text-violet-400",
      bg: "bg-violet-50/50 dark:bg-violet-900/20 border-violet-200/60 dark:border-violet-900/40"
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-sm ${item.bg}`}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">{item.label}</p>
            <p className={`text-xl font-black tabular-nums leading-tight ${item.accent}`}>{item.value}</p>
          </div>
          <p className="hidden text-[10px] font-bold leading-snug text-stone-500 dark:text-stone-500 sm:block">{item.helper}</p>
        </div>
      ))}
    </div>
  );
}
