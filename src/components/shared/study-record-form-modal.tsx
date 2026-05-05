"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArchiveIcon, ImageIcon, PlusIcon, TrashIcon, XIcon } from "@/components/ui/icons";
import type { KnowledgeAttachment, KnowledgeContentType, KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeAttachment, MistakeImportance, MistakeRecord } from "@/features/mistakes/types";
import type { SubjectKey } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

type RecordMode = "mistake" | "knowledge";
type SharedAttachment = MistakeAttachment | KnowledgeAttachment;

export interface StudyRecordFormValues {
  title: string;
  subjectKey: SubjectKey;
  chapter: string;
  importance: MistakeImportance;
  source: string;
  contentType: KnowledgeContentType;
  summary: string;
  content: string;
  caution: string;
  reviewTip: string;
  tagsText: string;
  attachments: SharedAttachment[];
  files: File[];
}

interface StudyRecordFormModalProps {
  open: boolean;
  mode: RecordMode;
  record?: MistakeRecord | KnowledgeRecord | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: StudyRecordFormValues) => Promise<void> | void;
}

const subjectOptions: Array<{ value: SubjectKey; label: string }> = [
  { value: "math", label: "数学" },
  { value: "english", label: "英语" },
  { value: "cs408", label: "408" }
];

const contentTypeOptions: Array<{ value: KnowledgeContentType; label: string }> = [
  { value: "concept", label: "知识点" },
  { value: "formula", label: "公式" },
  { value: "problem_pattern", label: "题型" },
  { value: "word", label: "单词" },
  { value: "phrase", label: "短语" },
  { value: "essay_material", label: "作文素材" },
  { value: "high_freq_point", label: "高频考点" },
  { value: "question_type", label: "题目类型" }
];

const importanceOptions: Array<{ value: MistakeImportance; label: string }> = [
  { value: 5, label: "5 核心必回看" },
  { value: 4, label: "4 高优先级" },
  { value: 3, label: "3 常规复盘" },
  { value: 2, label: "2 一般" },
  { value: 1, label: "1 低优先级" }
];

function isKnowledgeRecord(record?: MistakeRecord | KnowledgeRecord | null): record is KnowledgeRecord {
  return Boolean(record && "contentType" in record);
}

function createInitialValues(mode: RecordMode, record?: MistakeRecord | KnowledgeRecord | null): StudyRecordFormValues {
  if (record && isKnowledgeRecord(record)) {
    return {
      title: record.title,
      subjectKey: record.subjectKey,
      chapter: record.chapter ?? "",
      importance: (record.importance ?? 3) as MistakeImportance,
      source: record.source ?? "",
      contentType: record.contentType,
      summary: record.summary,
      content: record.content,
      caution: "",
      reviewTip: record.reviewTip,
      tagsText: record.tags.join("，"),
      attachments: record.attachments,
      files: []
    };
  }

  if (record) {
    return {
      title: record.title,
      subjectKey: record.subjectKey,
      chapter: record.chapter ?? "",
      importance: record.importance,
      source: record.source,
      contentType: "concept",
      summary: "",
      content: record.content,
      caution: record.caution,
      reviewTip: "",
      tagsText: record.tags.join("，"),
      attachments: record.attachments,
      files: []
    };
  }

  return {
    title: "",
    subjectKey: "math",
    chapter: "",
    importance: 3,
    source: "",
    contentType: mode === "knowledge" ? "concept" : "concept",
    summary: "",
    content: "",
    caution: "",
    reviewTip: "",
    tagsText: "",
    attachments: [],
    files: []
  };
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xs font-black text-stone-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm font-bold text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-sage-400 focus:bg-white";

export function StudyRecordFormModal({
  open,
  mode,
  record,
  submitting = false,
  onClose,
  onSubmit
}: StudyRecordFormModalProps) {
  const [values, setValues] = useState<StudyRecordFormValues>(() => createInitialValues(mode, record));
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(record);
  const title = `${isEditing ? "编辑" : "新增"}${mode === "mistake" ? "错题" : "知识点"}`;

  useEffect(() => {
    if (open) {
      setValues(createInitialValues(mode, record));
      setError(null);
    }
  }, [mode, open, record]);

  const pendingFileNames = useMemo(() => values.files.map((file) => file.name), [values.files]);

  if (!open) {
    return null;
  }

  const updateValue = <K extends keyof StudyRecordFormValues>(key: K, value: StudyRecordFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const removeAttachment = (attachmentId: string) => {
    setValues((current) => ({
      ...current,
      attachments: current.attachments.filter((attachment) => attachment.id !== attachmentId)
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.title.trim()) {
      setError("标题不能为空。");
      return;
    }

    if (!values.content.trim()) {
      setError(mode === "mistake" ? "错题内容不能为空。" : "核心内容不能为空。");
      return;
    }

    if (mode === "mistake" && !values.source.trim()) {
      setError("错题来源不能为空。");
      return;
    }

    if (mode === "knowledge" && !values.summary.trim()) {
      setError("知识点摘要不能为空。");
      return;
    }

    setError(null);
    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-stone-950/35 px-3 py-6 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/70 bg-white/90 p-5 text-stone-900 shadow-float backdrop-blur-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="soft-pill">
              <PlusIcon className="h-4 w-4" />
              {mode === "mistake" ? "错题记录" : "知识沉淀"}
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-stone-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="关闭表单"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="标题">
            <input
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              className={inputClass}
              placeholder="例如：极限存在的判断链路"
            />
          </Field>

          <Field label="科目">
            <select
              value={values.subjectKey}
              onChange={(event) => updateValue("subjectKey", event.target.value as SubjectKey)}
              className={inputClass}
            >
              {subjectOptions.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="章节">
            <input
              value={values.chapter}
              onChange={(event) => updateValue("chapter", event.target.value)}
              className={inputClass}
              placeholder="英语可留空"
            />
          </Field>

          <Field label="重要程度">
            <select
              value={values.importance}
              onChange={(event) => updateValue("importance", Number(event.target.value) as MistakeImportance)}
              className={inputClass}
            >
              {importanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          {mode === "knowledge" ? (
            <Field label="内容类型">
              <select
                value={values.contentType}
                onChange={(event) => updateValue("contentType", event.target.value as KnowledgeContentType)}
                className={inputClass}
              >
                {contentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field label="来源">
            <input
              value={values.source}
              onChange={(event) => updateValue("source", event.target.value)}
              className={inputClass}
              placeholder={mode === "mistake" ? "真题、模拟题、网课等" : "教材、笔记、题目等"}
            />
          </Field>
        </div>

        {mode === "knowledge" ? (
          <Field label="内容摘要" className="mt-4">
            <textarea
              value={values.summary}
              onChange={(event) => updateValue("summary", event.target.value)}
              className={`${inputClass} min-h-[88px] resize-y leading-7`}
              placeholder="用一句话说明这个知识点解决什么问题"
            />
          </Field>
        ) : null}

        <Field label={mode === "mistake" ? "错题内容" : "核心内容"} className="mt-4">
          <textarea
            value={values.content}
            onChange={(event) => updateValue("content", event.target.value)}
            className={`${inputClass} min-h-[130px] resize-y leading-7`}
            placeholder="支持粘贴文字说明，图片可在下方添加"
          />
        </Field>

        {mode === "mistake" ? (
          <Field label="注意事项" className="mt-4">
            <textarea
              value={values.caution}
              onChange={(event) => updateValue("caution", event.target.value)}
              className={`${inputClass} min-h-[96px] resize-y leading-7`}
              placeholder="写清下次如何避免同类错误"
            />
          </Field>
        ) : (
          <Field label="记忆提示" className="mt-4">
            <textarea
              value={values.reviewTip}
              onChange={(event) => updateValue("reviewTip", event.target.value)}
              className={`${inputClass} min-h-[96px] resize-y leading-7`}
              placeholder="写复盘口令、易混点或使用前提"
            />
          </Field>
        )}

        <Field label="标签" className="mt-4">
          <input
            value={values.tagsText}
            onChange={(event) => updateValue("tagsText", event.target.value)}
            className={inputClass}
            placeholder="用逗号、顿号或空格分隔，例如：极限，易错点"
          />
        </Field>

        <div className="mt-4 rounded-[24px] border border-white/60 bg-white/45 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-stone-700">图片 / 附件</p>
              <p className="mt-1 text-xs font-medium text-stone-500">
                支持截图、拍照和基础文件。云端模式会上传到 Supabase Storage，本地模式会先保留文件名。
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-2 text-sm font-bold text-sage-800 transition hover:bg-sage-100">
              <ImageIcon className="h-4 w-4" />
              添加文件
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                onChange={(event) =>
                  updateValue("files", [...values.files, ...Array.from(event.target.files ?? [])])
                }
              />
            </label>
          </div>

          {values.attachments.length > 0 || pendingFileNames.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {values.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2"
                >
                  <span className="truncate text-sm font-bold text-stone-700">{attachment.label}</span>
                  <button type="button" onClick={() => removeAttachment(attachment.id)} className="text-rose-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {pendingFileNames.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className="flex items-center gap-2 rounded-2xl border border-dashed border-sage-200 bg-sage-50/70 px-3 py-2 text-sm font-bold text-sage-800"
                >
                  <ArchiveIcon className="h-4 w-4" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-moss-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-moss-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitting ? "保存中..." : "保存记录"}
          </button>
        </div>
      </form>
    </div>
  );
}
