import { TrendIcon } from "@/components/ui/icons";
import type { StatsOverview } from "@/features/stats/types";

interface StatsDefinitionCardProps {
  overview: StatsOverview;
}

export function StatsDefinitionCard({ overview }: StatsDefinitionCardProps) {
  return (
    <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
      <div className="mb-4 flex items-center gap-2">
        <TrendIcon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        <div>
          <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">统计口径</h2>
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400">MVP 轻统计</p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs font-bold leading-relaxed">
        <div className="rounded-xl border border-sage-200/60 bg-sage-50/50 p-3 dark:border-sage-900/40 dark:bg-sage-900/20">
          <p className="font-black text-sage-800 dark:text-sage-300">热力图</p>
          <p className="mt-1 text-sage-700 dark:text-sage-400">最近 12 周每天活跃度，观察连续性与空档期。</p>
        </div>

        <div className="rounded-xl border border-sky-200/60 bg-sky-50/50 p-3 dark:border-sky-900/40 dark:bg-sky-900/20">
          <p className="font-black text-sky-800 dark:text-sky-300">趋势折线</p>
          <p className="mt-1 text-sky-700 dark:text-sky-400">最近 14 天活跃度变化，判断学习强度走向。</p>
        </div>

        <div className="rounded-xl border border-violet-200/60 bg-violet-50/50 p-3 dark:border-violet-900/40 dark:bg-violet-900/20">
          <p className="font-black text-violet-800 dark:text-violet-300">活跃度 = 任务×2 + 记录×1</p>
          <p className="mt-1 text-violet-700 dark:text-violet-400">
            活跃 {overview.activeDays} 天 · 最强一天 {overview.strongestDayLabel}（{overview.strongestDayScore} 分）
          </p>
        </div>
      </div>
    </div>
  );
}
