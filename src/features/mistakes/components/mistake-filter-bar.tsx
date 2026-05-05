import { SearchIcon, XIcon } from "@/components/ui/icons";
import { mistakeImportanceLabelMap } from "@/features/mistakes/utils";
import type { MistakeFilters, MistakeImportance } from "@/features/mistakes/types";
import { subjectMetas } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface MistakeFilterBarProps {
  filters: MistakeFilters;
  sourceOptions: string[];
  tagOptions: string[];
  onChange: (nextFilters: MistakeFilters) => void;
  onReset: () => void;
}

export function MistakeFilterBar({ filters, sourceOptions, tagOptions, onChange, onReset }: MistakeFilterBarProps) {
  const hasActiveFilters =
    filters.query !== "" ||
    filters.subjectKey !== "all" ||
    filters.importance !== "all" ||
    filters.source !== "all" ||
    filters.tag !== "all" ||
    filters.archiveView !== "active";

  const importanceLevels: MistakeImportance[] = [5, 4, 3, 2, 1];

  return (
    <div className="panel flex flex-col gap-4 border-white/40 bg-white/30 p-4 dark:border-stone-700/50 dark:bg-stone-900/40">
      {/* Top row: Search + Selects */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 h-4 w-4" />
          <input
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="搜索错题、来源、标签、注意事项..."
            className="w-full rounded-2xl border border-white/60 bg-white/50 py-2.5 pl-9 pr-4 text-sm font-bold text-stone-900 shadow-sm outline-none transition focus:border-sage-400 focus:bg-white/80 dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-100 dark:focus:bg-stone-800/80"
          />
        </div>

        <select
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value })}
          className="rounded-2xl border border-white/60 bg-white/50 px-3 py-2.5 text-sm font-bold text-stone-700 shadow-sm outline-none transition focus:border-sage-400 dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-300"
        >
          <option value="all">所有来源</option>
          {sourceOptions.map((src) => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>

        <select
          value={filters.tag}
          onChange={(e) => onChange({ ...filters, tag: e.target.value })}
          className="rounded-2xl border border-white/60 bg-white/50 px-3 py-2.5 text-sm font-bold text-stone-700 shadow-sm outline-none transition focus:border-sage-400 dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-300"
        >
          <option value="all">所有标签</option>
          {tagOptions.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <select
          value={filters.archiveView}
          onChange={(e) => onChange({ ...filters, archiveView: e.target.value as MistakeFilters["archiveView"] })}
          className="rounded-2xl border border-white/60 bg-white/50 px-3 py-2.5 text-sm font-bold text-stone-700 shadow-sm outline-none transition focus:border-sage-400 dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-300"
        >
          <option value="active">使用中的错题</option>
          <option value="archived">已归档错题</option>
          <option value="all">全部错题记录</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-2xl border border-rose-200/60 bg-rose-50/50 px-3 py-2.5 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100/60 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400"
          >
            <XIcon className="h-3.5 w-3.5" />
            重置筛选
          </button>
        )}
      </div>

      <div className="h-px border-t border-dashed border-white/60 dark:border-stone-700/50" />

      {/* Bottom row: Filter chips for quick access */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-stone-500">科目</span>
          <div className="flex gap-1.5">
            <FilterChip
              label="全部"
              active={filters.subjectKey === "all"}
              onClick={() => onChange({ ...filters, subjectKey: "all" })}
            />
            {subjectMetas.map((s) => (
              <FilterChip
                key={s.key}
                label={s.label}
                active={filters.subjectKey === s.key}
                onClick={() => onChange({ ...filters, subjectKey: s.key })}
              />
            ))}
          </div>
        </div>

        <div className="hidden h-4 w-px bg-stone-300/50 dark:bg-stone-700/50 xl:block" />

        {/* Importance Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-stone-500">重要度</span>
          <div className="flex gap-1.5 flex-wrap">
            <FilterChip
              label="全部"
              active={filters.importance === "all"}
              onClick={() => onChange({ ...filters, importance: "all" })}
            />
            {importanceLevels.map((lvl) => (
              <FilterChip
                key={lvl}
                label={`${lvl}-${mistakeImportanceLabelMap[lvl]}`}
                active={filters.importance === lvl}
                onClick={() => onChange({ ...filters, importance: lvl })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm",
        active
          ? "border-sage-400 bg-sage-50 text-sage-800 dark:border-sage-700/60 dark:bg-sage-900/40 dark:text-sage-300"
          : "border-white/50 bg-white/30 text-stone-600 hover:bg-white/60 dark:border-stone-700/50 dark:bg-stone-800/30 dark:text-stone-400 dark:hover:bg-stone-800/60"
      )}
    >
      {label}
    </button>
  );
}
