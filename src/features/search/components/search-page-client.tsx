"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ListDetailLayout } from "@/components/shared/list-detail-layout";
import { initialKnowledgeRecords } from "@/features/knowledge/mock-data";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import { initialMistakes } from "@/features/mistakes/mock-data";
import type { MistakeRecord } from "@/features/mistakes/types";
import { SearchDetailPanel } from "@/features/search/components/search-detail-panel";
import { SearchFilterPanel } from "@/features/search/components/search-filter-panel";
import { SearchOverviewCard } from "@/features/search/components/search-overview-card";
import { SearchPageHeader } from "@/features/search/components/search-page-header";
import { SearchResultBoard } from "@/features/search/components/search-result-board";
import type { GlobalSearchFilters, UnifiedSearchRecord } from "@/features/search/types";
import {
  buildUnifiedSearchRecords,
  calculateSearchOverview,
  defaultGlobalSearchFilters,
  filterSearchRecords,
  getAvailableSearchSources,
  getAvailableSearchTags
} from "@/features/search/utils";
import { initialTasks } from "@/features/tasks/mock-data";
import type { StudyTask } from "@/features/tasks/types";
import { normalizeTask } from "@/features/tasks/utils";
import { localDataKeys, usePersistentCollection } from "@/lib/local-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { notifyInfo } from "@/lib/toast";
import { listStudyRecordsFromApi } from "@/services/study-records";
import { listTasksFromApi } from "@/services/tasks";

function createDefaultFilters(): GlobalSearchFilters {
  return { ...defaultGlobalSearchFilters };
}

function reviveTasks(tasks: StudyTask[]) {
  return tasks.map(normalizeTask);
}

function getInitialSelectedRecordId(records: UnifiedSearchRecord[]) {
  return records.find((record) => !record.archivedAt)?.id ?? records[0]?.id ?? null;
}

export function SearchPageClient() {
  const remoteEnabled = hasSupabaseClientEnv();
  const seedTasks = useMemo(() => initialTasks.map(normalizeTask), []);
  const [tasks, setTasks, tasksState] = usePersistentCollection<StudyTask>(localDataKeys.tasks, {
    seedData: seedTasks,
    revive: reviveTasks,
    hydrateFromLocal: !remoteEnabled
  });
  const [mistakes, setMistakes, mistakesState] = usePersistentCollection<MistakeRecord>(localDataKeys.mistakes, {
    seedData: initialMistakes,
    hydrateFromLocal: !remoteEnabled
  });
  const [knowledgeRecords, setKnowledgeRecords, knowledgeState] = usePersistentCollection<KnowledgeRecord>(localDataKeys.knowledge, {
    seedData: initialKnowledgeRecords,
    hydrateFromLocal: !remoteEnabled
  });

  const records = useMemo(() => buildUnifiedSearchRecords(tasks, mistakes, knowledgeRecords), [tasks, mistakes, knowledgeRecords]);
  const [filters, setFilters] = useState<GlobalSearchFilters>(() => createDefaultFilters());
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => filterSearchRecords(records, filters), [records, filters]);
  const overview = useMemo(() => calculateSearchOverview(records, filteredRecords, filters), [records, filteredRecords, filters]);
  const tagOptions = useMemo(() => getAvailableSearchTags(records), [records]);
  const sourceOptions = useMemo(() => getAvailableSearchSources(records), [records]);

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedRecordId) ??
    records.find((record) => record.id === selectedRecordId) ??
    filteredRecords[0] ??
    records[0] ??
    null;

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!tasksState.isReady || !mistakesState.isReady || !knowledgeState.isReady || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    let mounted = true;

    if (!remoteEnabled) {
      if (!tasksState.hasLocalSnapshot) {
        tasksState.seedCollection();
      }
      if (!mistakesState.hasLocalSnapshot) {
        mistakesState.seedCollection();
      }
      if (!knowledgeState.hasLocalSnapshot) {
        knowledgeState.seedCollection();
      }

      return () => {
        mounted = false;
      };
    }

    Promise.all([listTasksFromApi(), listStudyRecordsFromApi("mistake"), listStudyRecordsFromApi("knowledge")])
      .then(([remoteTasks, remoteMistakes, remoteKnowledge]) => {
        if (!mounted) {
          return;
        }

        setTasks(remoteTasks.map(normalizeTask));
        setMistakes(remoteMistakes as MistakeRecord[]);
        setKnowledgeRecords(remoteKnowledge as KnowledgeRecord[]);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        if (tasksState.hasLocalSnapshot) {
          tasksState.restoreLocalSnapshot();
        } else {
          tasksState.seedCollection();
        }

        if (mistakesState.hasLocalSnapshot) {
          mistakesState.restoreLocalSnapshot();
        } else {
          mistakesState.seedCollection();
        }

        if (knowledgeState.hasLocalSnapshot) {
          knowledgeState.restoreLocalSnapshot();
        } else {
          knowledgeState.seedCollection();
        }

        notifyInfo("云端搜索数据暂时不可用", "当前结果已回退到设备上的本地数据。", "search-load-fallback");
      });

    return () => {
      mounted = false;
    };
  }, [
    knowledgeState.hasLocalSnapshot,
    knowledgeState.isReady,
    knowledgeState.restoreLocalSnapshot,
    knowledgeState.seedCollection,
    mistakesState.hasLocalSnapshot,
    mistakesState.isReady,
    mistakesState.restoreLocalSnapshot,
    mistakesState.seedCollection,
    remoteEnabled,
    setKnowledgeRecords,
    setMistakes,
    setTasks,
    tasksState.hasLocalSnapshot,
    tasksState.isReady,
    tasksState.restoreLocalSnapshot,
    tasksState.seedCollection
  ]);

  useEffect(() => {
    if (selectedRecordId && records.some((record) => record.id === selectedRecordId)) {
      return;
    }

    setSelectedRecordId(getInitialSelectedRecordId(filteredRecords.length > 0 ? filteredRecords : records));
  }, [filteredRecords, records, selectedRecordId]);

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4">
        <SearchPageHeader />

        <ListDetailLayout
          className="xl:grid-cols-[300px_minmax(0,1fr)]"
          sidebarClassName="xl:top-[124px]"
          detailWidthClassName="lg:grid-cols-[minmax(0,1fr)_380px]"
          sidebar={
            <>
              <SearchOverviewCard
                totalCount={overview.totalCount}
                filteredCount={overview.filteredCount}
                taskCount={overview.taskCount}
                mistakeCount={overview.mistakeCount}
                knowledgeCount={overview.knowledgeCount}
                activeFilterCount={overview.activeFilterCount}
                query={filters.query}
              />

              <SearchFilterPanel
                filters={filters}
                resultCount={filteredRecords.length}
                totalCount={records.length}
                tagOptions={tagOptions}
                sourceOptions={sourceOptions}
                onChange={setFilters}
                onReset={() => setFilters(createDefaultFilters())}
              />
            </>
          }
          list={<SearchResultBoard records={filteredRecords} selectedRecordId={selectedRecord?.id ?? null} onSelect={setSelectedRecordId} />}
          detail={<SearchDetailPanel record={selectedRecord} />}
        />
      </div>
    </main>
  );
}
