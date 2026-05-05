"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { KnowledgeSpotlightCard } from "@/features/home/components/knowledge-spotlight-card";
import { KnowledgeNotesCard } from "@/features/home/components/knowledge-notes-card";
import { StudyProgressCard } from "@/features/home/components/study-progress-card";
import { TodayTasksCard, getTodayTaskProgressPercent } from "@/features/home/components/today-tasks-card";
import { useTaskData } from "@/features/tasks/hooks/use-task-data";
import { initialKnowledgeRecords } from "@/features/knowledge/mock-data";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import { initialMistakes } from "@/features/mistakes/mock-data";
import type { MistakeRecord } from "@/features/mistakes/types";
import { buildHomeKnowledgeCards, buildHomeStatistics, buildSubjectProgress } from "@/features/home/utils/dashboard";
import { localDataKeys, usePersistentCollection } from "@/lib/local-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { notifyInfo } from "@/lib/toast";
import { listStudyRecordsFromApi } from "@/services/study-records";

export function HomeDashboardClient() {
  const { tasks } = useTaskData();
  const remoteEnabled = hasSupabaseClientEnv();
  const [mistakes, setMistakes, mistakeState] = usePersistentCollection<MistakeRecord>(localDataKeys.mistakes, {
    seedData: initialMistakes,
    hydrateFromLocal: !remoteEnabled
  });
  const [knowledgeRecords, setKnowledgeRecords, knowledgeState] = usePersistentCollection<KnowledgeRecord>(
    localDataKeys.knowledge,
    {
      seedData: initialKnowledgeRecords,
      hydrateFromLocal: !remoteEnabled
    }
  );
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!remoteEnabled || !mistakeState.isReady || !knowledgeState.isReady || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    let mounted = true;

    Promise.all([listStudyRecordsFromApi("mistake"), listStudyRecordsFromApi("knowledge")])
      .then(([remoteMistakes, remoteKnowledge]) => {
        if (!mounted) {
          return;
        }

        setMistakes(remoteMistakes as MistakeRecord[]);
        setKnowledgeRecords(remoteKnowledge as KnowledgeRecord[]);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        if (mistakeState.hasLocalSnapshot) {
          mistakeState.restoreLocalSnapshot();
        } else {
          mistakeState.seedCollection();
        }

        if (knowledgeState.hasLocalSnapshot) {
          knowledgeState.restoreLocalSnapshot();
        } else {
          knowledgeState.seedCollection();
        }

        notifyInfo(
          "首页学习记录已回退到本地快照",
          "知识点卡片与仪表盘统计暂时使用当前设备上的记录。",
          "home-dashboard-fallback"
        );
      });

    return () => {
      mounted = false;
    };
  }, [
    knowledgeState.hasLocalSnapshot,
    knowledgeState.isReady,
    knowledgeState.restoreLocalSnapshot,
    knowledgeState.seedCollection,
    mistakeState.hasLocalSnapshot,
    mistakeState.isReady,
    mistakeState.restoreLocalSnapshot,
    mistakeState.seedCollection,
    remoteEnabled,
    setKnowledgeRecords,
    setMistakes
  ]);

  const attendanceSeed = useMemo(() => [new Date().toISOString().split("T")[0]], []);
  const [attendance, setAttendance, attendanceState] = usePersistentCollection<string>(localDataKeys.attendance, {
    seedData: attendanceSeed,
    hydrateFromLocal: true
  });

  const toggleAttendance = useCallback((dateKey: string) => {
    const todayKey = new Date().toISOString().split("T")[0];
    if (dateKey > todayKey) return; // 不能标记未来的日期

    setAttendance((prev) => 
      prev.includes(dateKey) 
        ? prev.filter((d) => d !== dateKey) 
        : [...prev, dateKey]
    );
  }, [setAttendance]);

  // 统计逻辑
  const attendanceStats = useMemo(() => {
    const sorted = [...attendance].sort();
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];
    
    // 连续学习天数 (Streak)
    let streak = 0;
    let checkDate = new Date();
    // If today is not in attendance, check from yesterday
    if (!attendance.includes(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (streak < 365) {
      const key = checkDate.toISOString().split("T")[0];
      if (attendance.includes(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 本月学习天数
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const monthDays = attendance.filter(d => {
      const dt = new Date(d);
      return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
    }).length;

    // 本周学习天数
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const weekDays = attendance.filter(d => {
      const dt = new Date(d);
      return dt >= monday;
    }).length;

    return { streak, monthDays, weekDays };
  }, [attendance]);

  const statistics = useMemo(
    () => buildHomeStatistics(tasks, mistakes, knowledgeRecords),
    [knowledgeRecords, mistakes, tasks]
  );
  const taskProgressPercent = useMemo(() => getTodayTaskProgressPercent(tasks), [tasks]);
  const subjectProgress = useMemo(() => buildSubjectProgress(tasks), [tasks]);
  const cardsBySubject = useMemo(() => buildHomeKnowledgeCards(knowledgeRecords), [knowledgeRecords]);

  return (
    <div className="px-3 py-3 lg:px-4 lg:py-4">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        {/* 上排：今日任务(8) + 学习进度(4) - 通过 items-stretch 实现等高 */}
        <div className="grid items-stretch gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TodayTasksCard 
              tasks={tasks} 
              attendance={attendance}
              onToggleAttendance={toggleAttendance}
            />
          </div>
          <div className="lg:col-span-4">
            <StudyProgressCard 
              subjects={subjectProgress} 
              streakDays={attendanceStats.streak}
              monthDays={attendanceStats.monthDays}
              weekDays={attendanceStats.weekDays}
            />
          </div>
        </div>

        {/* 下排：知识点闪卡 - 占据全宽 */}
        <div className="w-full">
          <KnowledgeSpotlightCard cardsBySubject={cardsBySubject} />
        </div>
      </div>
    </div>
  );
}
