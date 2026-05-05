import type { SubjectKey } from "@/lib/constants/subjects";

export interface DailyActivityPoint {
  dateKey: string;
  label: string;
  completedTasks: number;
  studyRecords: number;
  activityScore: number;
  heatLevel: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapWeek {
  weekLabel: string;
  days: DailyActivityPoint[];
}

export interface TrendPoint {
  dateKey: string;
  label: string;
  completedTasks: number;
  studyRecords: number;
  activityScore: number;
}

export interface SubjectActivitySummary {
  subjectKey: SubjectKey;
  taskCompletedCount: number;
  studyRecordCount: number;
  activityScore: number;
}

export interface StatsOverview {
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  averageDailyScore: number;
  recentCompletedTasks: number;
  recentStudyRecords: number;
  recentAverageScore: number;
  strongestDayLabel: string;
  strongestDayScore: number;
}

export interface StatisticsSnapshot {
  heatmapWeeks: HeatmapWeek[];
  trendPoints: TrendPoint[];
  subjectSummaries: SubjectActivitySummary[];
  overview: StatsOverview;
  heatmapRangeLabel: string;
  trendRangeLabel: string;
}
