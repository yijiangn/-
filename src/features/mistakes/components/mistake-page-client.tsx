"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StudyRecordFormModal, type StudyRecordFormValues } from "@/components/shared/study-record-form-modal";
import { NoteIcon, PlusIcon } from "@/components/ui/icons";
import { MistakeAccordionList } from "@/features/mistakes/components/mistake-accordion-list";
import { MistakeFilterBar } from "@/features/mistakes/components/mistake-filter-bar";
import { MistakeStatsHud } from "@/features/mistakes/components/mistake-stats-hud";
import { defaultMistakeFilters, initialMistakes } from "@/features/mistakes/mock-data";
import type { MistakeFilters, MistakeRecord } from "@/features/mistakes/types";
import { calculateMistakeOverview, filterMistakes, getUniqueMistakeSources, getUniqueMistakeTags } from "@/features/mistakes/utils";
import { localDataKeys, usePersistentCollection } from "@/lib/local-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { notifyError, notifyInfo, notifySuccess, notifyUndo } from "@/lib/toast";
import { buildLocalAttachmentFromFile, uploadPendingStudyAttachments } from "@/services/attachments";
import { createStudyRecordInApi, deleteStudyRecordInApi, listStudyRecordsFromApi, updateStudyRecordInApi } from "@/services/study-records";

function createDefaultFilters(): MistakeFilters {
  return { ...defaultMistakeFilters };
}

function parseTags(value: string) {
  return Array.from(new Set(value.split(/[,\s，、;；]+/).map((tag) => tag.trim()).filter(Boolean)));
}

function buildMistakeRecord(values: StudyRecordFormValues, existing?: MistakeRecord | null): MistakeRecord {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? `mistake-${Date.now()}`,
    title: values.title.trim(),
    subjectKey: values.subjectKey,
    chapter: values.chapter.trim() || undefined,
    importance: values.importance,
    source: values.source.trim() || "未标注来源",
    content: values.content.trim(),
    caution: values.caution.trim() || "待补充注意事项",
    tags: parseTags(values.tagsText),
    attachments: values.attachments as MistakeRecord["attachments"],
    archivedAt: existing?.archivedAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

export function MistakePageClient() {
  const remoteEnabled = hasSupabaseClientEnv();
  const seedRecords = useMemo(() => initialMistakes, []);
  const [records, setRecords, recordsState] = usePersistentCollection<MistakeRecord>(localDataKeys.mistakes, {
    seedData: seedRecords,
    hydrateFromLocal: !remoteEnabled
  });
  const [filters, setFilters] = useState<MistakeFilters>(() => createDefaultFilters());
  const [isOfflineMode, setIsOfflineMode] = useState(!remoteEnabled);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MistakeRecord | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MistakeRecord | null>(null);

  const filteredRecords = useMemo(() => filterMistakes(records, filters), [records, filters]);
  const overview = useMemo(() => calculateMistakeOverview(records), [records]);
  const sourceOptions = useMemo(() => getUniqueMistakeSources(records), [records]);
  const tagOptions = useMemo(() => getUniqueMistakeTags(records), [records]);
  const hasFetched = useRef(false);
  const deleteTimersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!recordsState.isReady || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    let mounted = true;

    if (!remoteEnabled) {
      if (!recordsState.hasLocalSnapshot) {
        recordsState.seedCollection();
      }
      return () => {
        mounted = false;
      };
    }

    listStudyRecordsFromApi("mistake")
      .then((remoteRecords) => {
        if (mounted) {
          setRecords(remoteRecords as MistakeRecord[]);
          setIsOfflineMode(false);
        }
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        if (recordsState.hasLocalSnapshot) {
          recordsState.restoreLocalSnapshot();
        } else {
          recordsState.seedCollection();
        }

        setIsOfflineMode(true);
        notifyInfo("云端错题记录暂时不可用", "已回退到当前设备上的错题数据。", "mistakes-load-fallback");
      });

    return () => {
      mounted = false;
    };
  }, [
    recordsState.hasLocalSnapshot,
    recordsState.isReady,
    recordsState.restoreLocalSnapshot,
    recordsState.seedCollection,
    remoteEnabled,
    setRecords
  ]);

  useEffect(() => {
    return () => {
      deleteTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      deleteTimersRef.current.clear();
    };
  }, []);

  const canUseRemote = remoteEnabled && !isOfflineMode;

  async function persistRecord(record: MistakeRecord, files: File[], isCreate: boolean) {
    if (!canUseRemote) {
      return record;
    }

    const savedRecord = isCreate
      ? await createStudyRecordInApi("mistake", record)
      : await updateStudyRecordInApi("mistake", record);

    if (files.length === 0) {
      return savedRecord;
    }

    const uploadedAttachments = await uploadPendingStudyAttachments(savedRecord.id, files);
    return {
      ...savedRecord,
      attachments: [...savedRecord.attachments, ...uploadedAttachments] as MistakeRecord["attachments"],
      updatedAt: new Date().toISOString()
    } satisfies MistakeRecord;
  }

  async function handleSaveRecord(values: StudyRecordFormValues) {
    const existing = editingRecord;
    const baseRecord = buildMistakeRecord(values, existing);
    const localFileAttachments = canUseRemote ? [] : values.files.map((file, index) => buildLocalAttachmentFromFile(file, index));
    const optimisticRecord = {
      ...baseRecord,
      attachments: [...baseRecord.attachments, ...localFileAttachments] as MistakeRecord["attachments"]
    };
    const previousRecords = records;
    const isCreate = !existing;

    setFormSubmitting(true);
    setRecords((currentRecords) =>
      isCreate
        ? [optimisticRecord, ...currentRecords]
        : currentRecords.map((record) => (record.id === optimisticRecord.id ? optimisticRecord : record))
    );

    try {
      const finalRecord = await persistRecord(optimisticRecord, values.files, isCreate);
      setRecords((currentRecords) =>
        currentRecords.map((record) => (record.id === optimisticRecord.id ? finalRecord : record))
      );
      notifySuccess(isCreate ? "错题已新增" : "错题已更新", "记录已保存到当前数据源。", `mistake-save-${optimisticRecord.id}`);
      setFormOpen(false);
      setEditingRecord(null);
    } catch {
      setRecords(previousRecords);
      notifyError("错题保存失败", "本次修改没有成功写入，已恢复到保存前状态。", "mistake-save-failed");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function updateRecord(recordId: string, updater: (record: MistakeRecord) => MistakeRecord) {
    const currentRecord = records.find((record) => record.id === recordId);

    if (!currentRecord) {
      return;
    }

    const previousRecords = records;
    const nextRecord = {
      ...updater(currentRecord),
      updatedAt: new Date().toISOString()
    };

    setRecords((currentRecords) => currentRecords.map((record) => (record.id === recordId ? nextRecord : record)));

    if (!canUseRemote) {
      return;
    }

    try {
      const remoteRecord = await updateStudyRecordInApi("mistake", nextRecord);
      setRecords((currentRecords) =>
        currentRecords.map((record) => (record.id === recordId ? remoteRecord : record))
      );
    } catch {
      setRecords(previousRecords);
      notifyError("错题更新失败", "本次修改没有成功同步到云端，已恢复到更新前状态。", "mistake-update-failed");
    }
  }

  const handleArchiveToggle = async (recordId: string) => {
    await updateRecord(recordId, (record) => ({
      ...record,
      archivedAt: record.archivedAt ? null : new Date().toISOString()
    }));
  };

  function executeDelete(record: MistakeRecord) {
    setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
    setRecordToDelete(null);

    const undo = () => {
      const timer = deleteTimersRef.current.get(record.id);
      if (timer) {
        window.clearTimeout(timer);
        deleteTimersRef.current.delete(record.id);
      }
      setRecords((currentRecords) => (currentRecords.some((item) => item.id === record.id) ? currentRecords : [record, ...currentRecords]));
    };

    notifyUndo("错题已删除", "5 秒内可以撤销，本地列表已先移除。", undo, `mistake-delete-${record.id}`);

    if (!canUseRemote) {
      return;
    }

    const timer = window.setTimeout(async () => {
      deleteTimersRef.current.delete(record.id);
      try {
        await deleteStudyRecordInApi(record.id);
      } catch {
        setRecords((currentRecords) => (currentRecords.some((item) => item.id === record.id) ? currentRecords : [record, ...currentRecords]));
        notifyError("错题删除同步失败", "云端删除未完成，记录已恢复到列表中。", "mistake-delete-failed");
      }
    }, 5000);

    deleteTimersRef.current.set(record.id, timer);
  }

  return (
    <main className="min-h-screen px-3 py-3 lg:px-4 lg:py-4">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="soft-pill">
              <NoteIcon className="h-3.5 w-3.5" />
              错题管理
            </span>
            <h1 className="text-xl font-black text-stone-950 dark:text-stone-100 sm:text-2xl">沉淀错题集</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <MistakeStatsHud
              totalCount={overview.totalCount}
              archivedCount={overview.archivedCount}
              importantCount={overview.importantCount}
              imageCount={overview.imageCount}
              subjectCounts={overview.subjectCounts}
            />
            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-moss-700/85 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-moss-700"
            >
              <PlusIcon className="h-4 w-4" />
              新增错题
            </button>
          </div>
        </div>

        <MistakeFilterBar
          filters={filters}
          sourceOptions={sourceOptions}
          tagOptions={tagOptions}
          onChange={setFilters}
          onReset={() => setFilters(createDefaultFilters())}
        />

        <MistakeAccordionList
          records={filteredRecords}
          onArchiveToggle={handleArchiveToggle}
          onDelete={(recordId) => {
            const target = records.find((record) => record.id === recordId);
            if (target) {
              setRecordToDelete(target);
            }
          }}
          onEdit={(record) => {
            setEditingRecord(record);
            setFormOpen(true);
          }}
        />
      </div>

      <StudyRecordFormModal
        open={formOpen}
        mode="mistake"
        record={editingRecord}
        submitting={formSubmitting}
        onClose={() => {
          if (!formSubmitting) {
            setFormOpen(false);
            setEditingRecord(null);
          }
        }}
        onSubmit={handleSaveRecord}
      />

      <ConfirmDialog
        open={Boolean(recordToDelete)}
        title="删除这条错题？"
        description={recordToDelete ? `将删除「${recordToDelete.title}」。删除后 5 秒内可以撤销。` : undefined}
        confirmLabel="删除"
        tone="danger"
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            executeDelete(recordToDelete);
          }
        }}
      />
    </main>
  );
}
