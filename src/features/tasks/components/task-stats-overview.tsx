import { ProgressRing } from "@/components/ui/progress-ring";
import type { SubjectKey } from "@/lib/constants/subjects";
import { subjectMetas, subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface TaskStatsOverviewProps {
  totalCount: number;
  todayCount: number;
  todayDoneCount: number;
  longTermCount: number;
  completedCount: number;
  delayedCount: number;
  progressPercent: number;
  subjectCounts: Array<{ subjectKey: SubjectKey; count: number }>;
}

export function TaskStatsOverview({
  totalCount,
  todayCount,
  todayDoneCount,
  longTermCount,
  completedCount,
  delayedCount,
  progressPercent,
  subjectCounts,
}: TaskStatsOverviewProps) {
  return (
    <section className="panel flex flex-col gap-5 bg-gradient-to-br from-moss-900/55 via-moss-800/45 to-moss-700/40 p-5 text-white dark:from-moss-950/65 dark:via-moss-900/55 dark:to-moss-800/50">
      {/* Ring + title */}
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-2xl border border-white/20 bg-white/5 p-1.5 backdrop-blur-md">
          <ProgressRing value={progressPercent} size={76} sublabel="整体" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-white">进度概览</h2>
          <p className="mt-0.5 text-xs text-sage-50/70">所有活跃任务平均进度</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <Chip label="总任务" value={totalCount} />
            <Chip label="已完成" value={completedCount} highlight />
            {delayedCount > 0 && <Chip label="延期" value={delayedCount} warning />}
          </div>
        </div>
      </div>

      {/* Today vs Long-term */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox
          label="今日"
          value={`${todayDoneCount}/${todayCount}`}
          sub="已完成"
          accent="text-sage-300"
        />
        <StatBox
          label="长期"
          value={longTermCount}
          sub="条任务"
          accent="text-violet-300"
        />
      </div>

      {/* Subject distribution */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">科目分布</p>
        {subjectCounts
          .filter((s) => s.count > 0)
          .map((item) => {
            const subject = subjectMetaMap[item.subjectKey];
            const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            return (
              <div key={item.subjectKey} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white/90">{subject.label}</span>
                  <span className="text-[10px] font-bold text-white/60">{item.count} 项</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", subject.accentBarClass, "opacity-80")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function Chip({ label, value, highlight, warning }: { label: string; value: number | string; highlight?: boolean; warning?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-black",
      highlight ? "text-sage-300" : warning ? "text-red-300" : "text-white/70"
    )}>
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", highlight ? "bg-sage-400" : warning ? "bg-red-400" : "bg-white/30")} />
      {label} {value}
    </span>
  );
}

function StatBox({ label, value, sub, accent }: { label: string; value: number | string; sub: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-black tabular-nums leading-none", accent)}>{value}</p>
      <p className="mt-0.5 text-[10px] text-white/50">{sub}</p>
    </div>
  );
}
