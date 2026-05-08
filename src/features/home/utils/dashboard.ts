import type { KnowledgeCardItem } from "@/features/home/mock-data";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import { buildStatisticsSnapshot } from "@/features/stats/utils";
import type { StudyTask } from "@/features/tasks/types";
import { isVisibleInToday } from "@/features/tasks/utils";
import { subjectMetas } from "@/lib/constants/subjects";

export function calculateHomeTaskProgressPercent(tasks: StudyTask[]) {
  const todayTasks = tasks.filter(isVisibleInToday);

  if (todayTasks.length === 0) {
    return 0;
  }

  const total = todayTasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(total / todayTasks.length);
}

export function buildHomeKnowledgeCards(records: KnowledgeRecord[]) {
  const emptyCollection = subjectMetas.reduce(
    (result, subject) => {
      result[subject.key] = [];
      return result;
    },
    {} as Record<KnowledgeRecord["subjectKey"], KnowledgeCardItem[]>
  );

  return records.reduce((result, record) => {
    if (record.archivedAt) {
      return result;
    }

    result[record.subjectKey].push({
      id: record.id,
      subjectKey: record.subjectKey,
      title: record.title,
      summary: record.summary || record.content.slice(0, 120),
      tags: record.tags,
      source: record.source || "未标注来源",
      note: record.reviewTip || "建议补充复习提示。"
    });

    return result;
  }, emptyCollection);
}

export function buildSubjectProgress(tasks: StudyTask[]) {
  return subjectMetas.map((subject) => {
    const subjectTasks = tasks.filter((task) => task.subjectKey === subject.key && !task.archivedAt);
    const percent =
      subjectTasks.length > 0
        ? Math.round(subjectTasks.reduce((sum, task) => sum + task.progress, 0) / subjectTasks.length)
        : 0;

    return {
      key: subject.key,
      name: subject.label,
      percent,
      colorClassName: subject.accentBarClass
    };
  });
}

export function buildHomeStatistics(tasks: StudyTask[], mistakes: MistakeRecord[], knowledgeRecords: KnowledgeRecord[]) {
  return buildStatisticsSnapshot(tasks, mistakes, knowledgeRecords);
}
