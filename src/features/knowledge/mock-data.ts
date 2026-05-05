import type { KnowledgeContentType, KnowledgeFilters, KnowledgeRecord } from "@/features/knowledge/types";

export const defaultKnowledgeFilters: KnowledgeFilters = {
  query: "",
  subjectKey: "all",
  contentType: "all",
  tag: "all",
  archiveView: "active"
};

export const knowledgeContentTypeOptions: Array<{ value: KnowledgeContentType | "all"; label: string }> = [
  { value: "all", label: "全部内容类型" },
  { value: "concept", label: "知识点" },
  { value: "formula", label: "公式" },
  { value: "problem_pattern", label: "题型" },
  { value: "word", label: "单词" },
  { value: "phrase", label: "短语" },
  { value: "essay_material", label: "作文素材" },
  { value: "high_freq_point", label: "高频考点" },
  { value: "question_type", label: "题目类型" }
];

export const knowledgeArchiveViewOptions = [
  { value: "active", label: "仅显示有效内容" },
  { value: "archived", label: "仅显示已归档" },
  { value: "all", label: "显示全部" }
] as const;

export const initialKnowledgeRecords: KnowledgeRecord[] = [
  {
    id: "knowledge-math-1",
    title: "极限存在的判定链路",
    subjectKey: "math",
    contentType: "concept",
    chapter: "极限与连续",
    source: "高数基础笔记",
    importance: 4,
    summary: "先判左右极限，再看定义域与分段点，最后决定能否直接套常规极限法则。",
    content:
      "分段函数、绝对值函数和含参数函数求极限时，不要急着代公式。先画出分段点附近的左右趋势，再判断左右极限是否存在且相等，最后再考虑是否能用等价无穷小、夹逼或洛必达。",
    reviewTip: "一看到“分段 / 绝对值 / 参数”就先写左右极限，不要直接把题目带进熟悉公式里。",
    tags: ["极限", "基础链路", "易混点"],
    attachments: [{ id: "knowledge-att-m-1", label: "极限判定草图", kind: "photo", tone: "emerald" }],
    createdAt: "2026-03-24T08:10:00.000Z",
    updatedAt: "2026-03-24T08:35:00.000Z"
  },
  {
    id: "knowledge-math-2",
    title: "洛必达法则使用条件",
    subjectKey: "math",
    contentType: "formula",
    chapter: "极限与连续",
    source: "真题复盘卡片",
    importance: 5,
    summary: "只有在满足未定式与邻域可导等条件时，洛必达法则才能成立。",
    content:
      "常见形式是 0/0 或 ∞/∞，但仅满足形式还不够。还需要分子分母在去心邻域可导、分母导函数不为 0，且导数比值的极限存在或趋于无穷。对分段函数尤其要额外检查可导条件。",
    reviewTip: "看到洛必达先问自己三件事：是不是未定式、邻域里能不能导、分母导数会不会为 0。",
    tags: ["洛必达", "公式", "高频"],
    attachments: [{ id: "knowledge-att-m-2", label: "条件清单截图", kind: "screenshot", tone: "amber" }],
    createdAt: "2026-03-22T15:10:00.000Z",
    updatedAt: "2026-03-22T15:30:00.000Z"
  },
  {
    id: "knowledge-math-3",
    title: "二重积分换序题的处理步骤",
    subjectKey: "math",
    contentType: "problem_pattern",
    chapter: "多元函数积分学",
    source: "积分专题整理",
    importance: 4,
    summary: "画区域、选切法、改边界、再写积分顺序，是换序题最稳的四步。",
    content:
      "这类题不要凭感觉直接改上下限。先把区域画清楚，再决定按 x 还是 y 分层。重新写边界时一定以新的积分顺序为主语，最后再回头检查是否遗漏分段区间。",
    reviewTip: "换序题最怕脑补区域，宁可多花 30 秒画图，也不要省略图像步骤。",
    tags: ["积分换序", "题型", "画图"],
    attachments: [{ id: "knowledge-att-m-3", label: "换序区域图", kind: "photo", tone: "sky" }],
    createdAt: "2026-03-21T19:20:00.000Z",
    updatedAt: "2026-03-21T19:40:00.000Z"
  },
  {
    id: "knowledge-en-1",
    title: "constrain",
    subjectKey: "english",
    contentType: "word",
    source: "核心词复盘第 8 组",
    importance: 4,
    summary: "常表示“限制、约束”，高频出现在经济、制度、资源类语境。",
    content:
      "constrain 常见搭配是 constrain growth、constrain choices、be constrained by resources。它强调受到条件、规则或资源的限制，语气比 simply limit 更正式。",
    reviewTip: "和 restrict 对比记忆：constrain 更偏“被条件束缚”，restrict 更偏“外部限制行为”。",
    tags: ["单词", "阅读", "高频词"],
    attachments: [{ id: "knowledge-att-e-1", label: "词汇卡片", kind: "screenshot", tone: "rose" }],
    createdAt: "2026-03-23T07:50:00.000Z",
    updatedAt: "2026-03-23T08:05:00.000Z"
  },
  {
    id: "knowledge-en-2",
    title: "be prone to",
    subjectKey: "english",
    contentType: "phrase",
    source: "阅读表达积累",
    importance: 3,
    summary: "表示“容易……，倾向于……”，常用于风险、错误、疾病等负向语境。",
    content:
      "be prone to mistakes、be prone to anxiety、be prone to flooding 都很常见。后面多接名词或动名词，和 tend to 相比，be prone to 更强调易受某种不利情况影响。",
    reviewTip: "记忆时把 prone 和“问题倾向”绑定，不要在正式作文里乱接所有动作。",
    tags: ["短语", "写作", "易用错"],
    attachments: [],
    createdAt: "2026-03-20T21:00:00.000Z",
    updatedAt: "2026-03-20T21:15:00.000Z"
  },
  {
    id: "knowledge-en-3",
    title: "教育与科技双向促进",
    subjectKey: "english",
    contentType: "essay_material",
    source: "作文素材便签",
    importance: 4,
    summary: "适合科技、教育、社会发展主题作文的中层素材。",
    content:
      "Technology broadens access to educational resources, while education equips individuals with the ability to use technology more responsibly and creatively. When the two reinforce each other, both personal growth and social innovation can be accelerated.",
    reviewTip: "作文素材不要背成长段，优先记“主题句 + 承接句 + 结果句”的三段式骨架。",
    tags: ["作文素材", "教育", "科技"],
    attachments: [{ id: "knowledge-att-e-2", label: "作文素材便签", kind: "photo", tone: "slate" }],
    createdAt: "2026-03-18T18:30:00.000Z",
    updatedAt: "2026-03-18T19:10:00.000Z"
  },
  {
    id: "knowledge-408-1",
    title: "死锁四个必要条件",
    subjectKey: "cs408",
    contentType: "high_freq_point",
    chapter: "操作系统 / 死锁",
    source: "王道 408 复习指导",
    importance: 5,
    summary: "互斥、请求并保持、不可剥夺、循环等待，是死锁判断和预防题的母知识点。",
    content:
      "408 中既会直接考四个条件本身，也会反过来考“预防死锁时破坏了哪个条件”。做题时不能只背名字，还要能把每一个措施映射到具体被破坏的条件。",
    reviewTip: "高频考点不仅要会背，还要会做双向映射：条件 → 措施，措施 → 破坏哪个条件。",
    tags: ["操作系统", "死锁", "高频考点"],
    attachments: [{ id: "knowledge-att-c-1", label: "死锁条件整理", kind: "screenshot", tone: "amber" }],
    createdAt: "2026-03-24T10:00:00.000Z",
    updatedAt: "2026-03-24T10:20:00.000Z"
  },
  {
    id: "knowledge-408-2",
    title: "B+ 树与 B 树的区别",
    subjectKey: "cs408",
    contentType: "concept",
    chapter: "数据结构 / 查找",
    source: "数据结构索引专题",
    importance: 4,
    summary: "B+ 树非叶节点只索引不存数据，所有关键记录集中在叶子节点。",
    content:
      "B+ 树更适合磁盘和数据库索引，因为叶子节点天然有序且可顺序遍历，范围查询效率更稳定。B 树则在每个节点都可能命中数据，单点查询路径上更灵活，但范围查询组织性不如 B+ 树。",
    reviewTip: "记区别时优先抓三件事：数据放在哪、叶子是否串联、范围查询谁更友好。",
    tags: ["数据结构", "B+树", "索引"],
    attachments: [{ id: "knowledge-att-c-2", label: "B树对比图", kind: "photo", tone: "emerald" }],
    createdAt: "2026-03-22T09:00:00.000Z",
    updatedAt: "2026-03-22T09:35:00.000Z"
  },
  {
    id: "knowledge-408-3",
    title: "完全二叉树编号题的判断方法",
    subjectKey: "cs408",
    contentType: "question_type",
    chapter: "数据结构 / 树",
    source: "树结构错题延伸",
    importance: 3,
    summary: "先确认根节点编号起点，再套父子关系公式，是这类题的统一入口。",
    content:
      "编号题常把“考试定义从 1 开始”和“代码下标从 0 开始”混在一起出陷阱。审题时要先锁定编号起点，再根据编号关系推导父节点、左孩子和右孩子的位置。",
    reviewTip: "一旦题目涉及编号关系，第一步不是算，而是确认编号从 0 还是从 1 开始。",
    tags: ["树", "题目类型", "编号"],
    attachments: [],
    archivedAt: "2026-03-19T22:00:00.000Z",
    createdAt: "2026-03-19T21:20:00.000Z",
    updatedAt: "2026-03-19T22:00:00.000Z"
  }
];
