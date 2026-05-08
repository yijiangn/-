"use client";

import { useEffect, useState } from "react";
import { EditIcon, PlusIcon, XIcon } from "@/components/ui/icons";
import { taskStatusOptions } from "@/features/tasks/mock-data";
import type { StudyTask, TaskFormValues } from "@/features/tasks/types";
import { subjectMetas } from "@/lib/constants/subjects";
import { notifyError } from "@/lib/toast";
import { validateTaskFormValues } from "@/lib/validation";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  editingTask?: StudyTask | null;
}

const initialFormState: TaskFormValues = {
  title: "",
  subjectKey: "math",
  bucket: "today",
  status: "not_started",
  progress: 0,
  focus: "",
  note: "",
  estimateLabel: "",
  deadlineLabel: ""
};

export function TaskFormModal({ open, onClose, onSubmit, editingTask }: TaskFormModalProps) {
  const isEditing = !!editingTask;
  const [formValues, setFormValues] = useState<TaskFormValues>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setFormValues({
        title: editingTask.title,
        subjectKey: editingTask.subjectKey,
        bucket: editingTask.bucket,
        status: editingTask.status,
        progress: editingTask.progress,
        focus: editingTask.focus,
        note: editingTask.note || "",
        estimateLabel: editingTask.estimateLabel || "",
        deadlineLabel: editingTask.deadlineLabel || "",
      });
    } else {
      setFormValues(initialFormState);
    }
    setFormError(null);
  }, [open, editingTask]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/35 px-0 py-0 backdrop-blur-sm sm:px-6 sm:py-8">
      <div className="flex min-h-full items-stretch justify-center sm:items-center">
        <div className="w-full max-w-2xl rounded-none border border-white/70 bg-white/95 shadow-soft sm:rounded-panel">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-5 sm:px-6">
            <div>
              <span className="soft-pill">
                {isEditing ? <EditIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                {isEditing ? "编辑任务" : "新增任务"}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                {isEditing ? "修改任务详情" : "先把能马上执行的任务记下来"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isEditing ? "修改任务标题、科目、进度等信息。" : "首版先保留最必要字段：任务名、科目、任务类型、状态、进度和简单说明。"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <form
            className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
            onSubmit={(event) => {
              event.preventDefault();
              const validation = validateTaskFormValues(formValues);

              if (!validation.success) {
                setFormError(validation.message);
                notifyError("任务表单未通过校验", validation.message, "task-form-invalid");
                return;
              }

              setFormError(null);
              onSubmit(validation.data);
            }}
          >
            {formError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                {formError}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">任务名称</label>
              <input
                required
                value={formValues.title}
                onChange={(event) => {
                  setFormError(null);
                  setFormValues((current) => ({ ...current, title: event.target.value }));
                }}
                placeholder="例如：英语阅读真题第 2 套"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">科目</label>
                <select
                  value={formValues.subjectKey}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, subjectKey: event.target.value as TaskFormValues["subjectKey"] }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                >
                  {subjectMetas.map((subject) => (
                    <option key={subject.key} value={subject.key}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">任务类型</label>
                <select
                  value={formValues.bucket}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, bucket: event.target.value as TaskFormValues["bucket"] }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                >
                  <option value="today">今日任务</option>
                  <option value="long_term">长期任务</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">状态</label>
                <select
                  value={formValues.status}
                  onChange={(event) => {
                    const nextStatus = event.target.value as TaskFormValues["status"];
                    setFormValues((current) => ({
                      ...current,
                      status: nextStatus,
                      progress: nextStatus === "completed" ? 100 : current.progress
                    }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                >
                  {taskStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">进度：{formValues.progress}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={formValues.progress}
                  onChange={(event) => {
                    const nextProgress = Number(event.target.value);
                    setFormValues((current) => ({
                      ...current,
                      progress: nextProgress,
                      status:
                        nextProgress === 100
                          ? "completed"
                          : nextProgress > 0 && current.status === "not_started"
                            ? "in_progress"
                            : current.status === "completed" && nextProgress < 100
                              ? "in_progress"
                              : current.status
                    }));
                  }}
                  className="mt-3 w-full accent-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">任务说明</label>
              <textarea
                rows={3}
                value={formValues.focus}
                onChange={(event) => setFormValues((current) => ({ ...current, focus: event.target.value }))}
                placeholder="这次任务的执行重点是什么？"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">预计时长</label>
                <input
                  value={formValues.estimateLabel}
                  onChange={(event) => setFormValues((current) => ({ ...current, estimateLabel: event.target.value }))}
                  placeholder="例如：45 分钟"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">截止提示</label>
                <input
                  value={formValues.deadlineLabel}
                  onChange={(event) => setFormValues((current) => ({ ...current, deadlineLabel: event.target.value }))}
                  placeholder="例如：今晚自习前"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">备注</label>
              <textarea
                rows={3}
                value={formValues.note}
                onChange={(event) => setFormValues((current) => ({ ...current, note: event.target.value }))}
                placeholder="补充执行顺序、易遗漏点或复盘提醒"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white"
              >
                取消
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-moss-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-moss-700"
              >
                保存任务
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
