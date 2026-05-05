import { ProgressRing } from "@/components/ui/progress-ring";
import type { SubjectKey } from "@/lib/constants/subjects";
import { subjectMetaMap } from "@/lib/constants/subjects";

interface TaskOverviewCardProps {
  totalCount: number;
  todayCount: number;
  longTermCount: number;
  completedCount: number;
  delayedCount: number;
  progressPercent: number;
  subjectCounts: Array<{
    subjectKey: SubjectKey;
    label: string;
    count: number;
  }>;
  onCreate: () => void;
}

export function TaskOverviewCard({
  totalCount,
  todayCount,
  longTermCount,
  completedCount,
  delayedCount,
  progressPercent,
  subjectCounts,
  onCreate
}: TaskOverviewCardProps) {
  return (
    <section className="panel relative overflow-hidden bg-gradient-to-br from-moss-900/60 via-moss-800/50 to-moss-700/50 p-6 text-white dark:from-moss-950/70 dark:via-moss-900/60 dark:to-moss-800/60">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-sage-200/5 blur-2xl" />

      <div className="relative space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-sage-50">
              今日任务与长期任务总览
            </span>
            <h2 className="mt-4 text-2xl font-semibold">任务推进一眼看清</h2>
            <p className="mt-2 text-sm leading-6 text-sage-50/80">
              先完成今日主任务，再推进长期整理，避免任务堆积但不落地。
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/20 bg-white/5 p-2 backdrop-blur-md">
            <ProgressRing value={progressPercent} size={96} sublabel="整体进度" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <OverviewMetric label="有效任务" value={totalCount} />
          <OverviewMetric label="今日任务" value={todayCount} />
          <OverviewMetric label="长期任务" value={longTermCount} />
          <OverviewMetric label="已完成 / 延期" value={`${completedCount} / ${delayedCount}`} />
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">按科目分布</p>
            <button
              type="button"
              onClick={onCreate}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
            >
              快速新建
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {subjectCounts.map((item) => {
              const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              const subject = subjectMetaMap[item.subjectKey];

              return (
                <div key={item.subjectKey} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="text-sage-50/80">{item.count} 项</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${subject.accentBarClass}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function OverviewMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
      <p className="text-xs text-sage-50/80">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
