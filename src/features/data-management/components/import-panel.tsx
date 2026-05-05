import { useMemo } from "react";
import { FileTextIcon, ImageIcon, PlusIcon, RefreshIcon, UploadIcon, XIcon, FilterIcon } from "@/components/ui/icons";
import type { ImportPreviewItem, ImportTarget } from "@/features/data-management/types";
import {
  buildKnowledgeTemplateCsv,
  buildMistakeTemplateCsv,
  buildTaskTemplateCsv,
  importTargetOptions
} from "@/features/data-management/utils";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface ImportPanelProps {
  target: ImportTarget;
  textInput: string;
  files: File[];
  fileInputKey: number;
  previewItems: ImportPreviewItem[];
  isBuildingPreview: boolean;
  onTargetChange: (target: ImportTarget) => void;
  onTextChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onBuildPreview: () => Promise<void>;
  onApplyImport: () => void;
  onResetPreview: () => void;
}

const templateMap = {
  task: { name: "task-template.csv", content: buildTaskTemplateCsv },
  mistake: { name: "mistake-template.csv", content: buildMistakeTemplateCsv },
  knowledge: { name: "knowledge-template.csv", content: buildKnowledgeTemplateCsv }
} as const;

export function ImportPanel({
  target,
  textInput,
  files,
  fileInputKey,
  previewItems,
  isBuildingPreview,
  onTargetChange,
  onTextChange,
  onFilesChange,
  onBuildPreview,
  onApplyImport,
  onResetPreview
}: ImportPanelProps) {
  const validPreviewCount = useMemo(() => previewItems.filter((item) => item.payload).length, [previewItems]);

  function handleDownloadTemplate(targetValue: ImportTarget) {
    const template = templateMap[targetValue];
    const blob = new Blob([template.content()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = template.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5 xl:grid-cols-2 lg:items-start">
      {/* ── Left Column: Config & Input ── */}
      <div className="space-y-4 lg:col-span-3 xl:col-span-1">
        {/* Panel 1: Target Collection */}
        <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">写入目标与标准模板</h2>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400">选择数据要归入什么分类中</p>
            </div>
            {/* Inline template buttons */}
            <div className="hidden items-center gap-1.5 sm:flex">
              {importTargetOptions.map((option) => (
                <button
                  key={`tmpl-${option.value}`}
                  type="button"
                  onClick={() => handleDownloadTemplate(option.value)}
                  className="rounded-lg border border-white/60 bg-white/50 px-2 py-1 text-[10px] font-black uppercase text-stone-600 transition hover:bg-white dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  ↓ {option.label}模板
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {importTargetOptions.map((option) => {
              const active = target === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTargetChange(option.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-center transition",
                    active
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "border-white/50 bg-white/40 text-stone-600 hover:bg-white/60 dark:border-stone-700/50 dark:bg-stone-800/40 dark:text-stone-400 dark:hover:bg-stone-800/60"
                  )}
                >
                  <p className="text-xs font-black">{option.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Input Methods */}
        <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
          <div className="mb-4">
            <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">原始数据输入</h2>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400">目前仅支持基础解析，智能功能规划中</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400">
                <FileTextIcon className="h-3.5 w-3.5" />
                文本解析区 (可贴入 CSV 文本)
              </span>
              <textarea
                value={textInput}
                onChange={(event) => onTextChange(event.target.value)}
                placeholder="在此直接粘贴 CSV 文本、Markdown 短笔记等，系统尝试分离生成独立卡片..."
                rows={5}
                className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm font-bold leading-relaxed text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-stone-800 focus:bg-white dark:border-stone-700/40 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-400 dark:focus:bg-stone-900"
              />
            </label>

            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400">
                <ImageIcon className="h-3.5 w-3.5" />
                资源文件上传
              </span>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/40 p-4 text-center transition hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900/40 dark:hover:border-stone-500">
                <UploadIcon className="h-5 w-5 text-stone-400" />
                <p className="mt-2 text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  点击选取或拖拽文件至此 (CSV/TXT/MD/图片)
                </p>
                <input
                  key={fileInputKey}
                  type="file"
                  multiple
                  onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))}
                  className="sr-only"
                  accept=".csv,.txt,.md,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                />
              </label>

              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {files.map((file) => (
                    <span key={file.name} className="soft-pill !py-0.5 text-[10px]">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Row for Generation */}
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onResetPreview}
                className="flex-1 rounded-xl border border-white/60 bg-stone-100/50 py-2.5 text-xs font-black text-stone-600 transition hover:bg-white dark:border-stone-700/50 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                清空数据
              </button>
              <button
                type="button"
                onClick={onBuildPreview}
                disabled={isBuildingPreview || (!textInput.trim() && files.length === 0)}
                className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-800 py-2.5 text-sm font-black text-stone-100 transition hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-white"
              >
                <PlusIcon className="h-4 w-4" />
                {isBuildingPreview ? "解析中..." : "进行解析，生成预览"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column: Preview & Output ── */}
      <div className="space-y-4 lg:col-span-2 xl:col-span-1 lg:sticky lg:top-6">
        {/* Panel 3: Validation & Preview */}
        <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-black text-stone-950 dark:text-stone-100">
              <FilterIcon className="h-4 w-4" />
              写入校验
            </h2>
            <span className={cn("text-[10px] font-black uppercase rounded-md px-2 py-0.5", validPreviewCount > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300" : "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400")}>
              有效解析 {validPreviewCount} / {previewItems.length}
            </span>
          </div>

          <div className="rounded-xl border border-white/40 bg-white/30 p-3 min-h-[300px] max-h-[500px] overflow-y-auto dark:border-stone-700/40 dark:bg-stone-900/30">
            {previewItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400">暂无预览内容，请在左侧输入并解析数据</p>
                <p className="mt-1 text-[10px] font-bold opacity-60">确保左侧目标分类选择正确</p>
              </div>
            ) : (
              <div className="space-y-3">
                {previewItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/60 bg-white/60 p-3 dark:border-stone-700/50 dark:bg-stone-800/50">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="soft-pill !py-0.5 !text-[9px]">{item.sourceKind.toUpperCase()}</span>
                        {item.payload && "subjectKey" in item.payload ? (
                          <span className={cn("text-[9px] font-black uppercase rounded text-stone-600 bg-stone-200/50 px-1 py-0.5 dark:text-stone-300 dark:bg-stone-700/50")}>
                            {subjectMetaMap[item.payload.subjectKey]?.label || item.payload.subjectKey}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[9px] font-bold text-stone-500 opacity-80">{item.sourceLabel}</span>
                    </div>
                    
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.title}</p>
                    <p className="mt-1 text-[11px] font-bold leading-relaxed text-stone-500 line-clamp-2 dark:text-stone-400">{item.summary}</p>
                    
                    {item.warnings.length > 0 && (
                      <div className="mt-2 space-y-1 rounded-md border border-amber-200/50 bg-amber-50/50 p-1.5 dark:border-amber-900/30 dark:bg-amber-900/20">
                        {item.warnings.map(warn => (
                          <p key={warn} className="text-[10px] font-bold text-amber-700 dark:text-amber-500">⚠ {warn}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onApplyImport}
              disabled={validPreviewCount === 0}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-600 dark:text-stone-100 dark:hover:bg-emerald-500"
            >
              <UploadIcon className="h-4 w-4" />
              确认无误，写入 {validPreviewCount} 条数据
            </button>
          </div>
        </div>

        {/* Panel 4: Notification AI */}
        <div className="panel border-sky-200/40 bg-sky-50/40 p-4 dark:border-sky-900/30 dark:bg-sky-900/20">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-sky-800 dark:text-sky-300">智能进化预告</h3>
          <p className="mt-1 text-[11px] font-bold leading-relaxed text-sky-700 dark:text-sky-400">
            首版本仅提供严格的模板解析，未来将引入基于 LLM 的混合内容阅读能力，允许直接粘贴大段图文，系统会自动帮你切分并打好标签。
          </p>
        </div>
      </div>
    </div>
  );
}
