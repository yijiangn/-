import type { TaskBucket, TaskFilters, TaskStatus, StudyTask } from "@/features/tasks/types";

export const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "not_started", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "delayed", label: "延期" },
  { value: "completed", label: "已完成" }
];

export const taskBucketOptions: Array<{ value: TaskBucket | "all"; label: string }> = [
  { value: "all", label: "全部任务" },
  { value: "today", label: "今日任务" },
  { value: "long_term", label: "长期规划任务" }
];

export const archiveViewOptions = [
  { value: "active", label: "仅显示有效任务" },
  { value: "archived", label: "仅显示已归档" },
  { value: "all", label: "显示全部" }
] as const;

export const defaultTaskFilters: TaskFilters = {
  query: "",
  bucket: "all",
  subjectKey: "all",
  status: "all",
  archiveView: "active"
};

export const initialTasks: StudyTask[] = [
  {
    id: "task-a1",
    title: "高数真题：极限与连续性",
    subjectKey: "math",
    bucket: "today",
    status: "completed",
    progress: 100,
    steps: ["完成题组", "标记错因", "整理解法", "复盘完成"],
    currentStep: 3,
    focus: "做完一组题后，整理常见未定式和解题步骤。",
    note: "今天重点不是刷更多题，而是把错因写清楚。",
    estimateLabel: "60 分钟",
    deadlineLabel: "今晚 18:00 前",
    createdAt: "2026-03-24T07:50:00.000Z"
  },
  {
    id: "task-a2",
    title: "英语核心词第 8 组复盘",
    subjectKey: "english",
    bucket: "today",
    status: "in_progress",
    progress: 65,
    steps: ["快速过词", "筛高频词", "补短语搭配", "回看作文替换"],
    currentStep: 2,
    focus: "优先复习作文能直接用上的词组和替换表达。",
    note: "复习时顺手补充短语搭配到知识点卡片。",
    estimateLabel: "40 分钟",
    deadlineLabel: "午休前完成",
    createdAt: "2026-03-24T08:10:00.000Z"
  },
  {
    id: "task-a3",
    title: "408：树与图专项选择题",
    subjectKey: "cs408",
    bucket: "today",
    status: "not_started",
    progress: 0,
    steps: ["先做高频题", "整理易错点", "回看知识点", "补录错题"],
    currentStep: 0,
    focus: "先做高频题型，再回看知识点抽卡。",
    note: "做完后把典型错题录入错题页。",
    estimateLabel: "90 分钟",
    deadlineLabel: "今晚自习前",
    createdAt: "2026-03-24T08:30:00.000Z"
  },
  {
    id: "task-a4",
    title: "整理今日错题到知识点卡片",
    subjectKey: "math",
    bucket: "today",
    status: "delayed",
    progress: 20,
    steps: ["筛选错题", "拆分知识点", "补注意事项", "归档整理"],
    currentStep: 1,
    focus: "把公式、易错点和注意事项拆开记录。",
    note: "优先补昨天没整理完的积分题。",
    estimateLabel: "25 分钟",
    deadlineLabel: "睡前",
    createdAt: "2026-03-24T10:20:00.000Z"
  },
  {
    id: "task-b1",
    title: "数学一轮公式总整理",
    subjectKey: "math",
    bucket: "long_term",
    status: "in_progress",
    progress: 52,
    steps: ["极限模块", "导数模块", "积分模块", "统一整理导出"],
    currentStep: 2,
    focus: "按章节归类，后面要能直接导出成复习 Markdown。",
    note: "先补极限、导数、积分三大块。",
    estimateLabel: "本周持续推进",
    deadlineLabel: "4 月上旬前",
    createdAt: "2026-03-18T09:00:00.000Z"
  },
  {
    id: "task-b2",
    title: "英语作文素材分类整理",
    subjectKey: "english",
    bucket: "long_term",
    status: "not_started",
    progress: 0,
    steps: ["搭分类框架", "补教育素材", "补科技素材", "补社会素材"],
    currentStep: 0,
    focus: "先按教育、科技、社会三类建基础素材库。",
    note: "后续可以和知识点页联动。",
    estimateLabel: "本周末开始",
    deadlineLabel: "4 月中旬前",
    createdAt: "2026-03-20T12:00:00.000Z"
  },
  {
    id: "task-b3",
    title: "408 操作系统高频考点复盘表",
    subjectKey: "cs408",
    bucket: "long_term",
    status: "in_progress",
    progress: 35,
    steps: ["进程同步", "内存管理", "死锁", "统一查漏"],
    currentStep: 1,
    focus: "按门类整理常见选择题陷阱和概念辨析。",
    note: "优先做进程同步、内存管理和死锁。",
    estimateLabel: "分 3 次完成",
    deadlineLabel: "本月内",
    createdAt: "2026-03-15T16:30:00.000Z"
  },
  {
    id: "task-b4",
    title: "补录上周英语阅读错题",
    subjectKey: "english",
    bucket: "long_term",
    status: "completed",
    progress: 100,
    steps: ["整理题干", "补充生词", "写注意事项", "归档完成"],
    currentStep: 3,
    focus: "把错题来源和生词短语都归档到记录页。",
    note: "已完成，可留作归档示例。",
    estimateLabel: "已完成",
    deadlineLabel: "已完成",
    archivedAt: "2026-03-23T21:20:00.000Z",
    createdAt: "2026-03-12T13:00:00.000Z"
  }
];
