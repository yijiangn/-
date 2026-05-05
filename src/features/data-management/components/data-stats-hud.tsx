import { cn } from "@/lib/utils";

interface DataStatsHudProps {
  totalTasks: number;
  totalMistakes: number;
  totalKnowledge: number;
  exportCount: number;
  previewCount: number;
}

export function DataStatsHud({
  totalTasks,
  totalMistakes,
  totalKnowledge,
  exportCount,
  previewCount,
}: DataStatsHudProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatPill label="任务" value={totalTasks} accent="text-amber-700 dark:text-amber-400" />
      <StatPill label="错题" value={totalMistakes} accent="text-rose-700 dark:text-rose-400" />
      <StatPill label="知识点" value={totalKnowledge} accent="text-sky-700 dark:text-sky-400" />

      <div className="hidden h-4 w-px bg-stone-300/50 dark:bg-stone-700/50 xl:block" />

      <StatPill label="满足导出" value={exportCount} accent="text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 border-emerald-200" />
      {previewCount > 0 && <StatPill label="待导入" value={previewCount} accent="text-violet-700 dark:text-violet-400 bg-violet-50/50 border-violet-200" />}
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-xl border bg-white/40 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm dark:bg-stone-900/40", accent)}>
      <span className="opacity-80 uppercase tracking-widest">{label}</span>
      <span className="text-sm tabular-nums">{value}</span>
    </div>
  );
}
