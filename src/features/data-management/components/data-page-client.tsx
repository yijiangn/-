"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataStatsHud } from "@/features/data-management/components/data-stats-hud";
import { ExportPanel } from "@/features/data-management/components/export-panel";
import { ImportPanel } from "@/features/data-management/components/import-panel";
import { DownloadIcon, FileTextIcon, UploadIcon } from "@/components/ui/icons";
import type {
  DataManagementTab,
  ExportConfig,
  ImportPreviewItem,
  ImportTarget
} from "@/features/data-management/types";
import {
  applyImportPreview,
  buildExportRecords,
  buildImportPreview,
  defaultExportConfig,
  downloadExportFile
} from "@/features/data-management/utils";
import { initialKnowledgeRecords } from "@/features/knowledge/mock-data";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import { initialMistakes } from "@/features/mistakes/mock-data";
import type { MistakeRecord } from "@/features/mistakes/types";
import {
  calculateSearchOverview,
  getAvailableSearchSources,
  getAvailableSearchTags
} from "@/features/search/utils";
import { initialTasks } from "@/features/tasks/mock-data";
import type { StudyTask } from "@/features/tasks/types";
import { normalizeTask } from "@/features/tasks/utils";
import { localDataKeys, usePersistentCollection } from "@/lib/local-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { notifyError, notifyInfo } from "@/lib/toast";
import { commitImportPreview, requestExportFile, requestImportPreview } from "@/services/data-management";
import { listStudyRecordsFromApi } from "@/services/study-records";
import { listTasksFromApi } from "@/services/tasks";

function reviveTasks(tasks: StudyTask[]) {
  return tasks.map(normalizeTask);
}

function createDefaultExportConfig(): ExportConfig {
  return {
    ...defaultExportConfig,
    filters: { ...defaultExportConfig.filters }
  };
}

export function DataPageClient() {
  const remoteEnabled = hasSupabaseClientEnv();
  const seedTasks = useMemo(() => initialTasks.map(normalizeTask), []);
  const [tab, setTab] = useState<DataManagementTab>("export");
  const [exportConfig, setExportConfig] = useState<ExportConfig>(() => createDefaultExportConfig());
  const [importTarget, setImportTarget] = useState<ImportTarget>("knowledge");
  const [textInput, setTextInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [isBuildingPreview, setIsBuildingPreview] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const [tasks, setTasks, tasksState] = usePersistentCollection<StudyTask>(localDataKeys.tasks, {
    seedData: seedTasks,
    revive: reviveTasks
  });
  const [mistakes, setMistakes, mistakesState] = usePersistentCollection<MistakeRecord>(localDataKeys.mistakes, {
    seedData: initialMistakes
  });
  const [knowledge, setKnowledge, knowledgeState] = usePersistentCollection<KnowledgeRecord>(localDataKeys.knowledge, {
    seedData: initialKnowledgeRecords
  });

  const collections = useMemo(() => ({ tasks, mistakes, knowledge }), [tasks, mistakes, knowledge]);
  const allRecords = useMemo(
    () => buildExportRecords(collections, { ...defaultExportConfig.filters, archiveView: "all" }),
    [collections]
  );
  const exportRecords = useMemo(
    () => buildExportRecords(collections, exportConfig.filters),
    [collections, exportConfig.filters]
  );
  const tagOptions = useMemo(() => getAvailableSearchTags(allRecords), [allRecords]);
  const sourceOptions = useMemo(() => getAvailableSearchSources(allRecords), [allRecords]);
  const searchOverview = useMemo(
    () => calculateSearchOverview(allRecords, exportRecords, exportConfig.filters),
    [allRecords, exportRecords, exportConfig.filters]
  );

  const archivedCount =
    tasks.filter((item) => item.archivedAt).length +
    mistakes.filter((item) => item.archivedAt).length +
    knowledge.filter((item) => item.archivedAt).length;
  const attachmentCount =
    mistakes.reduce((count, item) => count + item.attachments.length, 0) +
    knowledge.reduce((count, item) => count + item.attachments.length, 0);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!tasksState.isReady || !mistakesState.isReady || !knowledgeState.isReady || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    let mounted = true;

    Promise.all([listTasksFromApi(), listStudyRecordsFromApi("mistake"), listStudyRecordsFromApi("knowledge")])
      .then(([remoteTasks, remoteMistakes, remoteKnowledge]) => {
        if (!mounted) {
          return;
        }

        setTasks(remoteTasks.map(normalizeTask));
        setMistakes(remoteMistakes as MistakeRecord[]);
        setKnowledge(remoteKnowledge as KnowledgeRecord[]);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        if (!tasksState.hasStoredData) {
          tasksState.seedCollection();
        }
        if (!mistakesState.hasStoredData) {
          mistakesState.seedCollection();
        }
        if (!knowledgeState.hasStoredData) {
          knowledgeState.seedCollection();
        }

        notifyInfo(
          "云端数据管理暂时不可用",
          "当前导入导出先回退到设备上的本地数据。",
          "data-load-fallback"
        );
      });

    return () => {
      mounted = false;
    };
  }, [
    knowledgeState.hasStoredData,
    knowledgeState.isReady,
    knowledgeState.seedCollection,
    mistakesState.hasStoredData,
    mistakesState.isReady,
    mistakesState.seedCollection,
    setKnowledge,
    setMistakes,
    setTasks,
    tasksState.hasStoredData,
    tasksState.isReady,
    tasksState.seedCollection
  ]);

  function handleResetImportState() {
    setTextInput("");
    setFiles([]);
    setPreviewItems([]);
    setResultMessage(null);
    setFileInputKey((value) => value + 1);
  }

  async function handleBuildPreview() {
    if (!textInput.trim() && files.length === 0) {
      return;
    }

    setIsBuildingPreview(true);
    setResultMessage(null);

    try {
      const nextPreviewItems = remoteEnabled
        ? await requestImportPreview(importTarget, textInput, files)
        : await buildImportPreview(importTarget, textInput, files);
      setPreviewItems(nextPreviewItems);
    } catch {
      notifyError("导入预览生成失败", "请检查文本内容或文件格式后重试。", "import-preview-failed");
    } finally {
      setIsBuildingPreview(false);
    }
  }

  async function handleApplyImport() {
    const result = applyImportPreview(previewItems, collections);

    if (result.importedCount === 0) {
      setResultMessage("当前预览里没有通过校验的可导入数据，请调整内容或改用模板。");
      return;
    }

    setTasks(result.tasks);
    setMistakes(result.mistakes);
    setKnowledge(result.knowledge);
    setResultMessage(`已导入 ${result.importedCount} 条内容，任务页、错题页和知识点页都会看到最新数据。`);
    setPreviewItems([]);
    setTextInput("");
    setFiles([]);
    setFileInputKey((value) => value + 1);
    setTab("export");

    if (!remoteEnabled) {
      return;
    }

    try {
      await commitImportPreview(previewItems);
    } catch {
      notifyError("导入提交失败", "当前已保留在本地，但云端写入没有完成。", "import-commit-failed");
    }
  }

  async function handleExport() {
    try {
      if (!remoteEnabled) {
        downloadExportFile({
          config: exportConfig,
          records: exportRecords
        });
        return;
      }

      const blob = await requestExportFile(exportConfig);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const extension = exportConfig.format === "markdown" ? "md" : "csv";
      anchor.href = url;
      anchor.download = `${exportConfig.fileName || "kaoyan-study-export"}.${extension}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      notifyError("导出失败", "请稍后再试，或先切回本地导出。", "export-failed");
    }
  }

  return (
    <main className="min-h-screen px-3 py-3 lg:px-4 lg:py-4">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        {/* ── Page title HUD & Stats ── */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="soft-pill">
              <FileTextIcon className="h-3.5 w-3.5" />
              数据与备份
            </span>
            <h1 className="text-xl font-black text-stone-950 dark:text-stone-100 sm:text-2xl">
              导出与导入
            </h1>
          </div>

          <DataStatsHud
            totalTasks={tasks.length}
            totalMistakes={mistakes.length}
            totalKnowledge={knowledge.length}
            exportCount={exportRecords.length}
            previewCount={previewItems.length}
          />
        </div>

        {/* ── Tabs Bar ── */}
        <div className="flex border-b border-white/40 dark:border-stone-700/50 mb-2">
          <button
            type="button"
            onClick={() => setTab("export")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition ${
              tab === "export"
                ? "border-b-2 border-stone-800 text-stone-900 dark:border-stone-300 dark:text-stone-100"
                : "border-b-2 border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            }`}
          >
            <DownloadIcon className="h-4 w-4" />
            基于条件导出
          </button>
          <button
            type="button"
            onClick={() => setTab("import")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition ${
              tab === "import"
                ? "border-b-2 border-stone-800 text-stone-900 dark:border-stone-300 dark:text-stone-100"
                : "border-b-2 border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            }`}
          >
            <UploadIcon className="h-4 w-4" />
            解析并导入
          </button>
        </div>

        <div className="space-y-4">
            {resultMessage ? (
              <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm leading-6 text-emerald-800">
                {resultMessage}
              </div>
            ) : null}

            {tab === "export" ? (
              <ExportPanel
                config={exportConfig}
                records={exportRecords}
                totalCount={allRecords.length}
                tagOptions={tagOptions}
                sourceOptions={sourceOptions}
                onConfigChange={setExportConfig}
                onResetFilters={() =>
                  setExportConfig((current) => ({
                    ...current,
                    filters: { ...defaultExportConfig.filters }
                  }))
                }
                onExport={handleExport}
              />
            ) : (
              <ImportPanel
                target={importTarget}
                textInput={textInput}
                files={files}
                fileInputKey={fileInputKey}
                previewItems={previewItems}
                isBuildingPreview={isBuildingPreview}
                onTargetChange={(nextTarget) => {
                  setImportTarget(nextTarget);
                  setResultMessage(null);
                }}
                onTextChange={(value) => {
                  setTextInput(value);
                  setResultMessage(null);
                }}
                onFilesChange={(nextFiles) => {
                  setFiles(nextFiles);
                  setResultMessage(null);
                }}
                onBuildPreview={handleBuildPreview}
                onApplyImport={handleApplyImport}
                onResetPreview={handleResetImportState}
              />
            )}
          </div>
      </div>
    </main>
  );
}
