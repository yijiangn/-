import type { MistakeFilters, MistakeImportance, MistakeRecord } from "@/features/mistakes/types";

export const defaultMistakeFilters: MistakeFilters = {
  query: "",
  subjectKey: "all",
  importance: "all",
  source: "all",
  tag: "all",
  archiveView: "active"
};

export const mistakeImportanceOptions: Array<{ value: MistakeImportance | "all"; label: string }> = [
  { value: "all", label: "全部重要程度" },
  { value: 5, label: "5 - 核心必回看" },
  { value: 4, label: "4 - 高优先级" },
  { value: 3, label: "3 - 常规复盘" },
  { value: 2, label: "2 - 一般" },
  { value: 1, label: "1 - 低优先级" }
];

export const archiveViewOptions = [
  { value: "active", label: "仅显示有效错题" },
  { value: "archived", label: "仅显示已归档" },
  { value: "all", label: "显示全部" }
] as const;

export const initialMistakes: MistakeRecord[] = [
  {
    id: "mistake-math-1",
    title: "极限题里误用洛必达法则",
    subjectKey: "math",
    chapter: "极限与连续",
    importance: 5,
    source: "张宇真题 2008 年第 6 题",
    content:
      "原题在分段函数条件下求极限，我直接套用了洛必达法则，没有先确认左右邻域内可导，导致整个思路从第一步就错了。",
    caution:
      "遇到洛必达法则先判断是否属于 0/0 或 ∞/∞ 型，再检查函数在邻域内是否可导，分段函数尤其不能跳步。",
    tags: ["极限", "洛必达", "高频错点"],
    attachments: [
      { id: "att-m-1", label: "题目截图", kind: "screenshot", tone: "emerald" },
      { id: "att-m-2", label: "手写订正", kind: "photo", tone: "amber" }
    ],
    createdAt: "2026-03-24T08:40:00.000Z",
    updatedAt: "2026-03-24T09:10:00.000Z"
  },
  {
    id: "mistake-math-2",
    title: "二重积分换序后上下限写反",
    subjectKey: "math",
    chapter: "多元函数积分学",
    importance: 4,
    source: "1800 题 A 组",
    content:
      "画出积分区域后虽然知道要换序，但重新写积分限时把 x、y 的上下界混在一起，导致结果错误。",
    caution:
      "先画区域，再决定横切还是纵切；换序后必须重新根据新变量顺序写上下限，不能照抄原式。",
    tags: ["积分", "换序", "题型归类"],
    attachments: [{ id: "att-m-3", label: "区域草图", kind: "photo", tone: "sky" }],
    createdAt: "2026-03-22T14:00:00.000Z",
    updatedAt: "2026-03-22T14:30:00.000Z"
  },
  {
    id: "mistake-en-1",
    title: "阅读理解里误判作者态度",
    subjectKey: "english",
    importance: 4,
    source: "英语一 2019 Text 2",
    content:
      "题干问作者态度，我只看了结尾句的情绪词，没有结合前文让步和转折结构，选成了片面的支持态度。",
    caution:
      "态度题先看转折词和评价词，再判断整体语气；不要只抓一句带情绪的句子。",
    tags: ["阅读理解", "态度题", "转折词"],
    attachments: [{ id: "att-e-1", label: "原文截图", kind: "screenshot", tone: "rose" }],
    createdAt: "2026-03-21T11:20:00.000Z",
    updatedAt: "2026-03-21T11:50:00.000Z"
  },
  {
    id: "mistake-en-2",
    title: "作文替换词使用场景不当",
    subjectKey: "english",
    importance: 3,
    source: "作文批改记录",
    content:
      "为了提升表达，把 important 全部替换成 pivotal，但有些句子只是一般强调，强行替换后语气反而过重。",
    caution:
      "高阶词替换要看语境，不是所有句子都追求“更高级”；先保证自然搭配，再考虑表达层次。",
    tags: ["作文", "词汇替换", "搭配"],
    attachments: [],
    createdAt: "2026-03-19T20:10:00.000Z",
    updatedAt: "2026-03-19T20:30:00.000Z"
  },
  {
    id: "mistake-408-1",
    title: "死锁必要条件记混导致判断错误",
    subjectKey: "cs408",
    chapter: "操作系统 / 死锁",
    importance: 5,
    source: "王道 408 选择题 7.4",
    content:
      "题目考的是“预防死锁破坏哪个条件”，我把不可剥夺和请求与保持混淆，导致排除项时直接走偏。",
    caution:
      "四个必要条件不仅要会背，还要能对应到“如何破坏某个条件”；概念题优先做一一映射。",
    tags: ["操作系统", "死锁", "高频考点"],
    attachments: [
      { id: "att-c-1", label: "题目截图", kind: "screenshot", tone: "amber" },
      { id: "att-c-2", label: "概念整理", kind: "photo", tone: "emerald" }
    ],
    createdAt: "2026-03-23T16:00:00.000Z",
    updatedAt: "2026-03-23T16:35:00.000Z"
  },
  {
    id: "mistake-408-2",
    title: "完全二叉树编号规律题漏看根节点编号",
    subjectKey: "cs408",
    chapter: "数据结构 / 树",
    importance: 4,
    source: "408 高频题汇总",
    content:
      "题目默认根节点编号从 1 开始，但我按从 0 开始的数组下标习惯直接推导，整个编号关系全错。",
    caution:
      "树的编号题先确认根节点起始编号，再套左右孩子和父节点公式，不要把语言实现和考试定义混起来。",
    tags: ["数据结构", "树", "编号规律"],
    attachments: [{ id: "att-c-3", label: "层序草稿", kind: "photo", tone: "slate" }],
    createdAt: "2026-03-20T09:15:00.000Z",
    updatedAt: "2026-03-20T09:40:00.000Z"
  },
  {
    id: "mistake-archived-1",
    title: "英语长难句里错划主干",
    subjectKey: "english",
    importance: 2,
    source: "阅读真题精读笔记",
    content:
      "看到长后置定语后没有先找主句谓语，结果把修饰成分当成主干，分析方向完全偏离。",
    caution:
      "长难句先找主谓，再回收修饰成分；不要一上来逐词翻译。",
    tags: ["长难句", "语法", "阅读"],
    attachments: [],
    archivedAt: "2026-03-18T21:00:00.000Z",
    createdAt: "2026-03-18T20:30:00.000Z",
    updatedAt: "2026-03-18T21:00:00.000Z"
  }
];
