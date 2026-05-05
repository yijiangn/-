import type { KnowledgeContentType, KnowledgeFilters, KnowledgeRecord } from "@/features/knowledge/types";
import { subjectMetas } from "@/lib/constants/subjects";

export const knowledgeContentTypeLabelMap: Record<KnowledgeContentType, string> = {
  concept: "知识点",
  formula: "公式",
  problem_pattern: "题型",
  word: "单词",
  phrase: "短语",
  essay_material: "作文素材",
  high_freq_point: "高频考点",
  question_type: "题目类型"
};

export function getKnowledgeTypeClasses(contentType: KnowledgeContentType) {
  switch (contentType) {
    case "formula":
      return "border-moss-200 bg-moss-50 text-moss-700";
    case "word":
    case "phrase":
      return "border-sage-200 bg-sage-50 text-sage-700";
    case "essay_material":
      return "border-stone-200 bg-stone-100 text-stone-700";
    case "high_freq_point":
      return "border-moss-300 bg-moss-100 text-moss-800";
    case "question_type":
      return "border-stone-200 bg-stone-50 text-stone-700";
    default:
      return "border-sage-200 bg-white text-stone-700";
  }
}

export function getAttachmentToneClasses(tone: KnowledgeRecord["attachments"][number]["tone"]) {
  const toneMap = {
    emerald: "from-sage-100 via-white to-sage-50 border-sage-200",
    sky: "from-moss-100 via-white to-sage-50 border-moss-200",
    amber: "from-stone-100 via-white to-moss-50 border-stone-200",
    rose: "from-sage-50 via-white to-moss-50 border-sage-200",
    slate: "from-stone-100 via-white to-stone-50 border-stone-200"
  };

  return toneMap[tone];
}

export function filterKnowledgeRecords(records: KnowledgeRecord[], filters: KnowledgeFilters) {
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

      if (filters.contentType !== "all" && record.contentType !== filters.contentType) {
        return false;
      }

      if (filters.tag !== "all" && !record.tags.includes(filters.tag)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [record.title, record.chapter, record.summary, record.content, record.reviewTip, record.source, ...record.tags]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export function buildKnowledgeSections(records: KnowledgeRecord[]) {
  return subjectMetas
    .map((subject) => ({
      subject,
      records: records.filter((record) => record.subjectKey === subject.key)
    }))
    .filter((group) => group.records.length > 0);
}

export function calculateKnowledgeOverview(records: KnowledgeRecord[]) {
  const activeRecords = records.filter((record) => !record.archivedAt);
  const recordsWithImages = activeRecords.filter((record) => record.attachments.length > 0);

  const typeCounts = Object.entries(
    activeRecords.reduce<Record<string, number>>((result, record) => {
      result[record.contentType] = (result[record.contentType] ?? 0) + 1;
      return result;
    }, {})
  )
    .map(([contentType, count]) => ({
      contentType: contentType as KnowledgeContentType,
      label: knowledgeContentTypeLabelMap[contentType as KnowledgeContentType],
      count
    }))
    .sort((left, right) => right.count - left.count);

  return {
    totalCount: activeRecords.length,
    archivedCount: records.filter((record) => !!record.archivedAt).length,
    imageCount: recordsWithImages.length,
    typeCoverageCount: typeCounts.length,
    typeCounts,
    subjectCounts: subjectMetas.map((subject) => ({
      subjectKey: subject.key,
      label: subject.label,
      count: activeRecords.filter((record) => record.subjectKey === subject.key).length
    }))
  };
}

export function getUniqueKnowledgeTags(records: KnowledgeRecord[]) {
  return Array.from(new Set(records.flatMap((record) => record.tags))).sort((left, right) =>
    left.localeCompare(right, "zh-CN")
  );
}

export function getKnowledgeImportanceLabel(importance?: KnowledgeRecord["importance"]) {
  switch (importance) {
    case 5:
      return "最高优先";
    case 4:
      return "重点复盘";
    case 3:
      return "常规回看";
    case 2:
      return "辅助补充";
    case 1:
      return "轻量记录";
    default:
      return "未标记";
  }
}
