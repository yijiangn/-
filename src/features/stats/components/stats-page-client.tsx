"use client";

import { useEffect, useMemo, useRef } from "react";
import { initialKnowledgeRecords } from "@/features/knowledge/mock-data";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import { initialMistakes } from "@/features/mistakes/mock-data";
import type { MistakeRecord } from "@/features/mistakes/types";
import { StatsDefinitionCard } from "@/features/stats/components/stats-definition-card";
import { StatsHeatmapCard } from "@/features/stats/components/stats-heatmap-card";
import { StatsOverviewGrid } from "@/features/stats/components/stats-overview-grid";
import { StatsSubjectCard } from "@/features/stats/components/stats-subject-card";
import { StatsTrendCard } from "@/features/stats/components/stats-trend-card";
import { buildStatisticsSnapshot } from "@/features/stats/utils";
import { initialTasks } from "@/features/tasks/mock-data";
import type { StudyTask } from "@/features/tasks/types";
import { normalizeTask } from "@/features/tasks/utils";
import { localDataKeys, usePersistentCollection } from "@/lib/local-data";
import { notifyInfo } from "@/lib/toast";
import { listStudyRecordsFromApi } from "@/services/study-records";
import { listTasksFromApi } from "@/services/tasks";

function reviveTasks(tasks: StudyTask[]) {
  return tasks.map(normalizeTask);
}

export function StatsPageClient() {
  const seedTasks = useMemo(() => initialTasks.map(normalizeTask), []);
  const [tasks, setTasks, tasksState] = usePersistentCollection<StudyTask>(localDataKeys.tasks, {
    seedData: seedTasks,
    revive: reviveTasks
  });
  const [mistakes, setMistakes, mistakesState] = usePersistentCollection<MistakeRecord>(localDataKeys.mistakes, {
    seedData: initialMistakes
  });
  const [knowledgeRecords, setKnowledgeRecords, knowledgeState] = usePersistentCollection<KnowledgeRecord>(
    localDataKeys.knowledge,
    {
      seedData: initialKnowledgeRecords
    }
  );

  const snapshot = useMemo(
    () => buildStatisticsSnapshot(tasks, mistakes, knowledgeRecords),
    [tasks, mistakes, knowledgeRecords]
  );

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!tasksState.isReady || !mistakesState.isReady || !knowledgeState.isReady || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    let mounted = true;

    Promise.all([
      listTasksFromApi(),
      listStudyRecordsFromApi("mistake"),
      listStudyRecordsFromApi("knowledge")
    ])
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

        if (!tasksState.hasStoredData) {
          tasksState.seedCollection();
        }
        if (!mistakesState.hasStoredData) {
          mistakesState.seedCollection();
        }
        if (!knowledgeState.hasStoredData) {
          knowledgeState.seedCollection();
        }

        notifyInfo("云端统计数据暂时不可用", "统计结果已回退到当前设备上的数据。", "stats-load-fallback");
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
    setKnowledgeRecords,
    setMistakes,
    setTasks,
    tasksState.hasStoredData,
    tasksState.isReady,
    tasksState.seedCollection
  ]);

  return (
    <main className="min-h-screen px-3 py-3 lg:px-4 lg:py-4">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        {/* ① Title + HUD overview pills */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="soft-pill">
              学习统计
            </span>
            <h1 className="text-xl font-black text-stone-950 dark:text-stone-100 sm:text-2xl">
              近期数据纵览
            </h1>
          </div>
          <StatsOverviewGrid overview={snapshot.overview} />
        </div>

        {/* Charts Row: Heatmap + Trend side by side */}
        <div className="grid gap-4 xl:grid-cols-2">
          {/* ② Heatmap */}
          <StatsHeatmapCard weeks={snapshot.heatmapWeeks} rangeLabel={snapshot.heatmapRangeLabel} />

          {/* ③ Trend chart */}
          <StatsTrendCard points={snapshot.trendPoints} rangeLabel={snapshot.trendRangeLabel} />
        </div>

        {/* ④ Bottom 3-col: definition · subject · (future) */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <StatsDefinitionCard overview={snapshot.overview} />
          <StatsSubjectCard summaries={snapshot.subjectSummaries} />
        </div>
      </div>
    </main>
  );
}
