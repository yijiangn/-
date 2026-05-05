import { DownloadIcon, FilterIcon, SearchIcon } from "@/components/ui/icons";
import type { ExportConfig } from "@/features/data-management/types";
import type { UnifiedSearchRecord } from "@/features/search/types";
import {
  searchArchiveViewOptions,
  searchContentTypeOptions,
  searchImportanceOptions,
  searchScopeOptions
} from "@/features/search/utils";
import { subjectMetaMap, subjectMetas } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  config: ExportConfig;
  records: UnifiedSearchRecord[];
  totalCount: number;
  tagOptions: string[];
  sourceOptions: string[];
  onConfigChange: (nextConfig: ExportConfig) => void;
  onResetFilters: () => void;
  onExport: () => void;
}

const formatOptions: Array<{ value: ExportConfig["format"]; label: string; description: string }> = [
  { value: "markdown", label: "Markdown", description: "适合复盘阅读" },
  { value: "csv", label: "CSV", description: "结构化备份还原" }
];

export function ExportPanel({
  config,
  records,
  totalCount,
  tagOptions,
  sourceOptions,
  onConfigChange,
  onResetFilters,
  onExport
}: ExportPanelProps) {
  const { filters } = config;

  return (
    <div className="grid gap-4 lg:grid-cols-5 xl:grid-cols-2 lg:items-start">
      {/* ── Left Column: Config & Filters ── */}
      <div className="space-y-4 lg:col-span-3 xl:col-span-1">
        {/* Panel 1: Setup */}
        <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
          <div className="mb-4">
            <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">导出设置</h2>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400">选择文件名称与数据格式</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">导出文件名</span>
              <input
                value={config.fileName}
                onChange={(event) => onConfigChange({ ...config, fileName: event.target.value })}
                placeholder="kaoyan-study-export"
                className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm font-bold text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
              />
            </label>

            <div>
              <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">导出格式</span>
              <div className="grid grid-cols-2 gap-2">
                {formatOptions.map((option) => {
                  const active = config.format === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onConfigChange({ ...config, format: option.value })}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition",
                        active
                          ? "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "border-white/50 bg-white/40 text-stone-600 hover:bg-white/60 dark:border-stone-700/50 dark:bg-stone-800/40 dark:text-stone-400 dark:hover:bg-stone-800/60"
                      )}
                    >
                      <p className="text-xs font-black uppercase">{option.label}</p>
                      <p className="mt-0.5 text-[10px] font-bold opacity-80">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Filters */}
        <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
          <div className="mb-4">
            <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">二次筛选</h2>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400">只导出特定知识点或状态的卡片</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400">
                <SearchIcon className="h-3.5 w-3.5" />
                搜索关键词
              </span>
              <input
                value={filters.query}
                onChange={(event) => onConfigChange({ ...config, filters: { ...filters, query: event.target.value } })}
                placeholder="按标题、内容、标签等检索"
                className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm font-bold text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">目标分类</span>
                <select
                  value={filters.scope}
                  onChange={(event) => onConfigChange({ ...config, filters: { ...filters, scope: event.target.value as any } })}
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
                >
                  {searchScopeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
              
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">内容类型</span>
                <select
                  value={filters.contentType}
                  onChange={(event) => onConfigChange({ ...config, filters: { ...filters, contentType: event.target.value as any } })}
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
                >
                  {searchContentTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">归档与有效性</span>
                <select
                  value={filters.archiveView}
                  onChange={(event) => onConfigChange({ ...config, filters: { ...filters, archiveView: event.target.value as any } })}
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
                >
                  {searchArchiveViewOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">科目</span>
                <select
                  value={filters.subjectKey}
                  onChange={(event) => onConfigChange({ ...config, filters: { ...filters, subjectKey: event.target.value as any } })}
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
                >
                  <option value="all">全部科目</option>
                  {subjectMetas.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">标签检索</span>
                <select
                  value={filters.tag}
                  onChange={(event) => onConfigChange({ ...config, filters: { ...filters, tag: event.target.value } })}
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
                >
                  <option value="all">全部标签</option>
                  {tagOptions.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-600 dark:text-stone-400">来源信息</span>
                <select
                  value={filters.source}
                  onChange={(event) => onConfigChange({ ...config, filters: { ...filters, source: event.target.value } })}
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs font-bold text-stone-700 outline-none transition focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
                >
                  <option value="all">全部来源</option>
                  {sourceOptions.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column: Preview & Submit ── */}
      <div className="lg:col-span-2 xl:col-span-1 space-y-4 lg:sticky lg:top-6">
        {/* Panel 3: Preview */}
        <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-black text-stone-950 dark:text-stone-100">
              <FilterIcon className="h-4 w-4" />
              导出预览
            </h2>
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">命中 {records.length} 条</span>
          </div>

          <div className="rounded-xl border border-white/40 bg-white/30 p-3 min-h-[300px] max-h-[500px] overflow-y-auto dark:border-stone-700/40 dark:bg-stone-900/30">
            {records.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400">当前筛选条件下未找到可导出内容</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records.slice(0, 10).map((record) => (
                  <div key={record.id} className="rounded-xl border border-white/60 bg-white/50 p-3 dark:border-stone-700/50 dark:bg-stone-800/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="soft-pill !py-0.5">{record.typeLabel}</span>
                      <span className={cn("text-[10px] font-black uppercase rounded-md px-1.5 py-0.5", subjectMetaMap[record.subjectKey].accentSurfaceClass, subjectMetaMap[record.subjectKey].accentTextClass)}>
                        {subjectMetaMap[record.subjectKey].label}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-800 line-clamp-1 dark:text-stone-200">{record.title}</p>
                  </div>
                ))}
                {records.length > 10 && (
                  <p className="py-2 text-center text-xs font-bold text-stone-400 dark:text-stone-500">
                    + 其余 {records.length - 10} 条结果将被一并导出
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Action Row */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="flex-1 rounded-xl border border-white/60 bg-stone-100/50 py-2.5 text-xs font-black text-stone-600 transition hover:bg-white dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              重置条件
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={records.length === 0}
              className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-800 py-2.5 text-sm font-black text-stone-100 transition hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-white"
            >
              <DownloadIcon className="h-4 w-4" />
              导出 {config.format === "markdown" ? "Markdown" : "CSV"} 文件
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
