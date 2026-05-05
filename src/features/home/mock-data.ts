import { subjectMetas, type SubjectKey } from "@/lib/constants/subjects";

export { subjectMetas } from "@/lib/constants/subjects";
export type { SubjectKey, SubjectMeta } from "@/lib/constants/subjects";

export interface TodayTask {
  id: string;
  title: string;
  subjectKey: SubjectKey;
  subjectLabel: string;
  status: "completed" | "in_progress" | "todo";
  progress: number;
  focus: string;
  durationLabel: string;
}

export interface KnowledgeCardItem {
  id: string;
  subjectKey: SubjectKey;
  title: string;
  summary: string;
  tags: string[];
  source: string;
  note: string;
}

export const examInfo = {
  name: "2027 考研初试",
  targetDate: "2026-12-19",
  phaseLabel: "当前阶段：基础巩固 + 高频回看"
};

export const studyStreakDays = 6;

export const scenicHighlights = ["数学真题一轮回顾", "英语单词 45 分钟", "408 高频考点整理"];

export const todayTasks: TodayTask[] = [
  {
    id: "task-1",
    title: "高数真题：极限与连续性",
    subjectKey: "math",
    subjectLabel: "数学",
    status: "completed",
    progress: 100,
    focus: "整理错题来源和常用解法",
    durationLabel: "预计 60 分钟"
  },
  {
    id: "task-2",
    title: "英语核心词复盘第 8 组",
    subjectKey: "english",
    subjectLabel: "英语",
    status: "in_progress",
    progress: 65,
    focus: "重点记短语搭配和作文替换表达",
    durationLabel: "预计 40 分钟"
  },
  {
    id: "task-3",
    title: "408：数据结构树与图专项",
    subjectKey: "cs408",
    subjectLabel: "408",
    status: "todo",
    progress: 0,
    focus: "优先回顾高频考点和典型选择题",
    durationLabel: "预计 90 分钟"
  },
  {
    id: "task-4",
    title: "整理今日错题到知识点卡片",
    subjectKey: "math",
    subjectLabel: "数学",
    status: "todo",
    progress: 0,
    focus: "补充注意事项和常错原因",
    durationLabel: "预计 25 分钟"
  }
];

export const knowledgeCards: Record<SubjectKey, KnowledgeCardItem[]> = {
  math: [
    {
      id: "math-1",
      subjectKey: "math",
      title: "洛必达法则使用前提",
      summary:
        "必须先判断原式属于 0/0 或 ∞/∞ 型，且分子分母在邻域内可导。遇到分段函数时先检查可导条件。",
      tags: ["极限", "公式", "高频错点"],
      source: "张宇真题 1998-2010 训练册",
      note: "错因通常是跳过未定式判断，直接求导。"
    },
    {
      id: "math-2",
      subjectKey: "math",
      title: "二重积分换序的检查顺序",
      summary:
        "先画区域，再确定横切还是纵切更简单；换序后要重新写清变量上下限，不要直接照搬原积分限。",
      tags: ["积分", "题型归类"],
      source: "错题本截图整理",
      note: "这类题适合配图，后续可加图片附件。"
    }
  ],
  english: [
    {
      id: "english-1",
      subjectKey: "english",
      title: "作文替换表达：important → pivotal",
      summary:
        "在英语作文中，pivotal、vital、indispensable 可替换 important，能明显提升表达层次，但要注意句子搭配。",
      tags: ["作文素材", "词汇替换"],
      source: "作文模板积累",
      note: "建议和例句一起记，而不是孤立记单词。"
    },
    {
      id: "english-2",
      subjectKey: "english",
      title: "短语：be susceptible to",
      summary:
        "表示“容易受到……影响”，常见于阅读理解和写作。比 be influenced by 更正式。",
      tags: ["短语", "高频词组"],
      source: "阅读真题 2018 Text 2",
      note: "适合加入作文素材分类。"
    }
  ],
  cs408: [
    {
      id: "cs408-1",
      subjectKey: "cs408",
      title: "操作系统：死锁的四个必要条件",
      summary:
        "互斥、请求与保持、不可剥夺、循环等待。判断题和概念题中常考的是如何通过破坏某一条件预防死锁。",
      tags: ["操作系统", "高频考点"],
      source: "王道 408 复习指导",
      note: "后续可以扩展成按门类筛选。"
    },
    {
      id: "cs408-2",
      subjectKey: "cs408",
      title: "数据结构：完全二叉树编号规律",
      summary:
        "若结点编号为 i，则左孩子为 2i，右孩子为 2i+1，父节点为 ⌊i/2⌋。堆排序、层序存储经常用到。",
      tags: ["数据结构", "公式化记忆"],
      source: "已上传知识点摘录",
      note: "适合与堆的性质放在同一组复盘。"
    }
  ]
};
