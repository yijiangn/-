import type { SubjectActivitySummary } from "@/features/stats/types";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface StatsSubjectCardProps {
  summaries: SubjectActivitySummary[];
}

const barClassMap = {
  math: "bg-sage-500 dark:bg-sage-400",
  english: "bg-sky-500 dark:bg-sky-400",
  cs408: "bg-amber-500 dark:bg-amber-400"
} as const;

export function StatsSubjectCard({ summaries }: StatsSubjectCardProps) {
  const maxScore = Math.max(...summaries.map((item) => item.activityScore), 1);

  return (
    <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
      <div className="mb-4">
        <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">科目活跃分布</h2>
        <p className="text-xs font-bold text-stone-500 dark:text-stone-400">最近 14 天，判断哪一科在推进、哪一科在掉线</p>
      </div>

      <div className="space-y-3">
        {summaries.map((item) => {
          const subject = subjectMetaMap[item.subjectKey];
          const barWidth = `${Math.max(6, (item.activityScore / maxScore) * 100)}%`;

          return (
            <div key={item.subjectKey} className="rounded-2xl border border-white/50 bg-white/30 p-3 dark:border-stone-700/40 dark:bg-stone-900/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-lg border px-2 py-0.5 text-[10px] font-black", subject.accentSurfaceClass, subject.accentTextClass)}>
                    {subject.label}
                  </span>
                  <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                    完成 {item.taskCompletedCount} · 记录 {item.studyRecordCount}
                  </p>
                </div>
                <p className="text-lg font-black tabular-nums text-stone-900 dark:text-stone-100">{item.activityScore}</p>
              </div>

              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-stone-200/60 dark:bg-stone-800/60">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barClassMap[item.subjectKey])}
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
