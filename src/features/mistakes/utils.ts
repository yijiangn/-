import type { MistakeFilters, MistakeImportance, MistakeRecord } from "@/features/mistakes/types";
import { subjectMetas } from "@/lib/constants/subjects";

export const mistakeImportanceLabelMap: Record<MistakeImportance, string> = {
  1: "低优先级",
  2: "一般",
  3: "常规复盘",
  4: "高优先级",
  5: "核心必回看"
};

export function getMistakeImportanceClasses(importance: MistakeImportance) {
  if (importance >= 5) {
    return "border-moss-300 bg-moss-100 text-moss-800";
  }

  if (importance === 4) {
    return "border-sage-200 bg-sage-100 text-sage-700";
  }

  if (importance === 3) {
    return "border-moss-200 bg-moss-50 text-moss-700";
  }

  return "border-stone-200 bg-stone-50 text-stone-600";
}

export function getAttachmentToneClasses(tone: MistakeRecord["attachments"][number]["tone"]) {
  const toneMap = {
    emerald: "from-sage-100 via-white to-sage-50 border-sage-200",
    sky: "from-moss-100 via-white to-moss-50 border-moss-200",
    amber: "from-moss-100 via-white to-sage-50 border-moss-300",
    rose: "from-sage-50 via-white to-moss-50 border-moss-300",
    slate: "from-stone-100 via-white to-stone-50 border-stone-200"
  };

  return toneMap[tone];
}

export function filterMistakes(records: MistakeRecord[], filters: MistakeFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return records
    .filter((record) => {
      if (filters.archiveView === "active" && record.archivedAt) {
        return false;
      }

      if (filters.archiveView === "archived" && !record.archivedAt) {
        return false;
      }

      if (filters.subjectKey !== "all" && record.subjectKey !== filters.subjectKey) {
        return false;
      }

      if (filters.importance !== "all" && record.importance !== filters.importance) {
        return false;
      }

      if (filters.source !== "all" && record.source !== filters.source) {
        return false;
      }

      if (filters.tag !== "all" && !record.tags.includes(filters.tag)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [record.title, record.chapter, record.source, record.content, record.caution, ...record.tags]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((left, right) => {
      if (left.importance !== right.importance) {
        return right.importance - left.importance;
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
}

export function buildMistakeSections(records: MistakeRecord[]) {
  return subjectMetas
    .map((subject) => ({
      subject,
      records: records.filter((record) => record.subjectKey === subject.key)
    }))
    .filter((group) => group.records.length > 0);
}

export function calculateMistakeOverview(records: MistakeRecord[]) {
  const activeRecords = records.filter((record) => !record.archivedAt);
  const importantRecords = activeRecords.filter((record) => record.importance >= 4);
  const recordsWithImages = activeRecords.filter((record) => record.attachments.length > 0);

  return {
    totalCount: activeRecords.length,
    archivedCount: records.filter((record) => !!record.archivedAt).length,
    importantCount: importantRecords.length,
    imageCount: recordsWithImages.length,
    subjectCounts: subjectMetas.map((subject) => ({
      subjectKey: subject.key,
      label: subject.label,
      count: activeRecords.filter((record) => record.subjectKey === subject.key).length
    }))
  };
}

export function getUniqueMistakeSources(records: MistakeRecord[]) {
  return Array.from(new Set(records.map((record) => record.source)));
}

export function getUniqueMistakeTags(records: MistakeRecord[]) {
  return Array.from(new Set(records.flatMap((record) => record.tags))).sort((left, right) =>
    left.localeCompare(right, "zh-CN")
  );
}
