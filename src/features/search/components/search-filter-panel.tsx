import { FilterField, FilterInput, FilterPanel, FilterSelect } from "@/components/shared/filter-panel";
import { SearchIcon } from "@/components/ui/icons";
import type { GlobalSearchFilters } from "@/features/search/types";
import { searchArchiveViewOptions, searchContentTypeOptions, searchImportanceOptions, searchScopeOptions } from "@/features/search/utils";
import { subjectMetas } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface SearchFilterPanelProps {
  filters: GlobalSearchFilters;
  resultCount: number;
  totalCount: number;
  tagOptions: string[];
  sourceOptions: string[];
  onChange: (nextFilters: GlobalSearchFilters) => void;
  onReset: () => void;
}

export function SearchFilterPanel({
  filters,
  resultCount,
  totalCount,
  tagOptions,
  sourceOptions,
  onChange,
  onReset
}: SearchFilterPanelProps) {
  return (
    <FilterPanel
      title="搜索与筛选"
      subtitle={`当前命中 ${resultCount} / ${totalCount} 条内容`}
      badgeLabel="统一筛选"
      resetLabel="重置筛选"
      onReset={onReset}
    >
      <FilterField label="搜索内容">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <FilterInput
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="按标题、正文、标签、来源搜索"
            className="pl-10"
          />
        </div>
      </FilterField>

      <FilterField label="内容范围">
        <div className="flex flex-wrap gap-2">
          {searchScopeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...filters, scope: option.value })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                filters.scope === option.value
                  ? "border-moss-200 bg-moss-50 text-moss-800"
                  : "border-stone-200 bg-white/70 text-stone-500 hover:bg-sage-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterField>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <FilterField label="科目">
          <FilterSelect
            value={filters.subjectKey}
            onChange={(event) => onChange({ ...filters, subjectKey: event.target.value as GlobalSearchFilters["subjectKey"] })}
          >
            <option value="all">全部科目</option>
            {subjectMetas.map((subject) => (
              <option key={subject.key} value={subject.key}>
                {subject.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="内容类型">
          <FilterSelect
            value={filters.contentType}
            onChange={(event) => onChange({ ...filters, contentType: event.target.value as GlobalSearchFilters["contentType"] })}
          >
            {searchContentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="标签">
          <FilterSelect value={filters.tag} onChange={(event) => onChange({ ...filters, tag: event.target.value })}>
            <option value="all">全部标签</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="来源">
          <FilterSelect value={filters.source} onChange={(event) => onChange({ ...filters, source: event.target.value })}>
            <option value="all">全部来源</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="重要程度">
          <FilterSelect
            value={filters.importance}
            onChange={(event) => {
              const rawValue = event.target.value;
              onChange({
                ...filters,
                importance: rawValue === "all" ? "all" : (Number(rawValue) as GlobalSearchFilters["importance"])
              });
            }}
          >
            {searchImportanceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
      </div>

      <FilterField label="归档视图">
        <div className="flex flex-wrap gap-2">
          {searchArchiveViewOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...filters, archiveView: option.value })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                filters.archiveView === option.value
                  ? "border-moss-200 bg-moss-50 text-moss-800"
                  : "border-stone-200 bg-white/70 text-stone-500 hover:bg-sage-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterField>

      <div className="rounded-2xl border border-sage-100 bg-sage-50/60 px-3 py-3 text-xs leading-5 text-stone-600">
        来源、重要程度、标签只会匹配具备这些字段的内容；任务在标签筛选后会自动排除。
      </div>
    </FilterPanel>
  );
}
