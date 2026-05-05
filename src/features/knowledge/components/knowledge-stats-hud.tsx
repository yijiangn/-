import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";
import type { SubjectKey } from "@/lib/constants/subjects";

interface KnowledgeStatsHudProps {
  totalCount: number;
  typeCoverageCount: number;
  imageCount: number;
  archivedCount: number;
  subjectCounts: Array<{
    subjectKey: SubjectKey;
    label: string;
    count: number;
  }>;
}

export function KnowledgeStatsHud({
  totalCount,
  typeCoverageCount,
  imageCount,
  archivedCount,
  subjectCounts,
}: KnowledgeStatsHudProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Overview stats chips */}
      <div className="flex flex-wrap items-center gap-2">
        <StatPill label="有效内容" value={totalCount} accent="text-stone-900 dark:text-white border-stone-300 dark:border-stone-600" />
        {typeCoverageCount > 0 && <StatPill label="类型覆盖" value={typeCoverageCount} accent="text-cyan-700 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800" />}
        {imageCount > 0 && <StatPill label="图文记录" value={imageCount} accent="text-sky-700 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800" />}
        <StatPill label="已归档" value={archivedCount} accent="text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700" />
      </div>

      <div className="h-4 w-px bg-stone-300/50 dark:bg-stone-700/50 mx-1 hidden sm:block" />

      {/* Subject distribution */}
      <div className="flex flex-wrap items-center gap-2">
        {subjectCounts.filter(s => s.count > 0).map(s => {
          const meta = subjectMetaMap[s.subjectKey];
          return (
            <span key={s.subjectKey} className={cn("inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm", meta.accentSurfaceClass, meta.accentTextClass)}>
              <span>{s.label}</span>
              <span className="opacity-70">{s.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-xl border bg-white/40 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm dark:bg-stone-900/40", accent)}>
      <span className="opacity-70 uppercase tracking-widest">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
