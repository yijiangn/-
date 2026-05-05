import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask } from "@/features/tasks/types";
import { subjectMetas, type SubjectKey } from "@/lib/constants/subjects";
import type {
  DailyActivityPoint,
  HeatmapWeek,
  StatisticsSnapshot,
  StatsOverview,
  SubjectActivitySummary,
  TrendPoint
} from "@/features/stats/types";

const WEEKDAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const HEATMAP_TOTAL_DAYS = 84;
const TREND_DAYS = 14;

export function buildStatisticsSnapshot(
  tasks: StudyTask[],
  mistakes: MistakeRecord[],
  knowledgeRecords: KnowledgeRecord[]
): StatisticsSnapshot {
  const anchorDate = getAnchorDate(tasks, mistakes, knowledgeRecords);
  const heatmapStartDate = addDays(startOfWeek(anchorDate), -(HEATMAP_TOTAL_DAYS - 7));
  const rawDays = buildDailyActivityRange(heatmapStartDate, HEATMAP_TOTAL_DAYS, tasks, mistakes, knowledgeRecords);
  const maxScore = Math.max(...rawDays.map((day) => day.activityScore), 1);

  const normalizedDays = rawDays.map((day) => ({
    ...day,
    heatLevel: resolveHeatLevel(day.activityScore, maxScore)
  }));

  const heatmapWeeks = buildHeatmapWeeks(normalizedDays);
  const trendPoints = normalizedDays.slice(-TREND_DAYS).map<TrendPoint>((day) => ({
    dateKey: day.dateKey,
    label: day.label,
    completedTasks: day.completedTasks,
    studyRecords: day.studyRecords,
    activityScore: day.activityScore
  }));
  const overview = buildOverview(normalizedDays, trendPoints);
  const subjectSummaries = buildSubjectSummaries(tasks, mistakes, knowledgeRecords, trendPoints.map((point) => point.dateKey));

  return {
    heatmapWeeks,
    trendPoints,
    subjectSummaries,
    overview,
    heatmapRangeLabel: `${normalizedDays[0]?.label ?? ""} - ${normalizedDays[normalizedDays.length - 1]?.label ?? ""}`,
    trendRangeLabel: `${trendPoints[0]?.label ?? ""} - ${trendPoints[trendPoints.length - 1]?.label ?? ""}`
  };
}

export function getWeekdayLabels() {
  return WEEKDAY_LABELS;
}

function buildDailyActivityRange(
  startDate: Date,
  totalDays: number,
  tasks: StudyTask[],
  mistakes: MistakeRecord[],
  knowledgeRecords: KnowledgeRecord[]
) {
  const dayMap = new Map<string, DailyActivityPoint>();

  for (let index = 0; index < totalDays; index += 1) {
    const currentDate = addDays(startDate, index);
    const dateKey = toDateKey(currentDate);

    dayMap.set(dateKey, {
      dateKey,
      label: formatMonthDay(currentDate),
      completedTasks: 0,
      studyRecords: 0,
      activityScore: 0,
      heatLevel: 0
    });
  }

  tasks.forEach((task) => {
    if (task.status !== "completed") {
      return;
    }

    const day = dayMap.get(toDateKey(new Date(task.createdAt)));

    if (!day) {
      return;
    }

    day.completedTasks += 1;
    day.activityScore += 2;
  });

  [...mistakes, ...knowledgeRecords].forEach((record) => {
    const day = dayMap.get(toDateKey(new Date(record.createdAt)));

    if (!day) {
      return;
    }

    day.studyRecords += 1;
    day.activityScore += 1;
  });

  return Array.from(dayMap.values());
}

function buildHeatmapWeeks(days: DailyActivityPoint[]): HeatmapWeek[] {
  const weeks: HeatmapWeek[] = [];

  for (let index = 0; index < days.length; index += 7) {
    const weekDays = days.slice(index, index + 7);
    const firstDate = weekDays[0] ? new Date(`${weekDays[0].dateKey}T00:00:00`) : null;

    weeks.push({
      weekLabel: firstDate ? `${firstDate.getMonth() + 1}月` : "",
      days: weekDays
    });
  }

  return weeks;
}

function buildOverview(days: DailyActivityPoint[], trendPoints: TrendPoint[]): StatsOverview {
  const strongestDay = [...days].sort((left, right) => right.activityScore - left.activityScore)[0];

  return {
    activeDays: days.filter((day) => day.activityScore > 0).length,
    currentStreak: countTrailingStreak(days),
    bestStreak: countBestStreak(days),
    averageDailyScore: roundOneDigit(days.reduce((sum, day) => sum + day.activityScore, 0) / Math.max(days.length, 1)),
    recentCompletedTasks: trendPoints.reduce((sum, point) => sum + point.completedTasks, 0),
    recentStudyRecords: trendPoints.reduce((sum, point) => sum + point.studyRecords, 0),
    recentAverageScore: roundOneDigit(
      trendPoints.reduce((sum, point) => sum + point.activityScore, 0) / Math.max(trendPoints.length, 1)
    ),
    strongestDayLabel: strongestDay?.label ?? "--",
    strongestDayScore: strongestDay?.activityScore ?? 0
  };
}

function buildSubjectSummaries(
  tasks: StudyTask[],
  mistakes: MistakeRecord[],
  knowledgeRecords: KnowledgeRecord[],
  trendDateKeys: string[]
): SubjectActivitySummary[] {
  const dateKeySet = new Set(trendDateKeys);

  return subjectMetas
    .map((subject) => {
      const taskCompletedCount = tasks.filter(
        (task) =>
          task.subjectKey === subject.key &&
          task.status === "completed" &&
          dateKeySet.has(toDateKey(new Date(task.createdAt)))
      ).length;

      const mistakeCount = mistakes.filter(
        (record) => record.subjectKey === subject.key && dateKeySet.has(toDateKey(new Date(record.createdAt)))
      ).length;
      const knowledgeCount = knowledgeRecords.filter(
        (record) => record.subjectKey === subject.key && dateKeySet.has(toDateKey(new Date(record.createdAt)))
      ).length;
      const studyRecordCount = mistakeCount + knowledgeCount;

      return {
        subjectKey: subject.key,
        taskCompletedCount,
        studyRecordCount,
        activityScore: taskCompletedCount * 2 + studyRecordCount
      };
    })
    .sort((left, right) => right.activityScore - left.activityScore);
}

function countTrailingStreak(days: DailyActivityPoint[]) {
  let streak = 0;

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].activityScore <= 0) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function countBestStreak(days: DailyActivityPoint[]) {
  let current = 0;
  let best = 0;

  days.forEach((day) => {
    if (day.activityScore > 0) {
      current += 1;
      best = Math.max(best, current);
      return;
    }

    current = 0;
  });

  return best;
}

function resolveHeatLevel(score: number, maxScore: number): DailyActivityPoint["heatLevel"] {
  if (score <= 0) {
    return 0;
  }

  return Math.max(1, Math.min(4, Math.ceil((score / maxScore) * 4))) as DailyActivityPoint["heatLevel"];
}

function getAnchorDate(tasks: StudyTask[], mistakes: MistakeRecord[], knowledgeRecords: KnowledgeRecord[]) {
  const timestamps = [
    ...tasks.map((task) => new Date(task.createdAt).getTime()),
    ...mistakes.map((record) => new Date(record.createdAt).getTime()),
    ...knowledgeRecords.map((record) => new Date(record.createdAt).getTime())
  ].filter(Number.isFinite);

  return startOfDay(new Date(timestamps.length > 0 ? Math.max(...timestamps) : Date.now()));
}

function startOfWeek(date: Date) {
  const currentDate = startOfDay(date);
  const weekday = currentDate.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  return addDays(currentDate, diff);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthDay(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function roundOneDigit(value: number) {
  return Math.round(value * 10) / 10;
}
