interface SearchOverviewCardProps {
  totalCount: number;
  filteredCount: number;
  taskCount: number;
  mistakeCount: number;
  knowledgeCount: number;
  activeFilterCount: number;
  query: string;
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
      <p className="text-xs text-sage-50/75">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

export function SearchOverviewCard({
  totalCount,
  filteredCount,
  taskCount,
  mistakeCount,
  knowledgeCount,
  activeFilterCount,
  query
}: SearchOverviewCardProps) {
  return (
    <section className="rounded-[30px] border border-moss-900/20 bg-moss-900/90 p-5 text-white shadow-float">
      <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-sage-50">
        检索总览
      </span>
      <h2 className="mt-4 text-2xl font-semibold leading-tight">用一套筛选条件快速定位目标内容</h2>
      <p className="mt-3 text-sm leading-6 text-sage-50/80">
        标签、来源、归档和重要程度集中管理，避免错题、任务、知识点分散后难以回找。
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatPill label="命中结果" value={filteredCount} />
        <StatPill label="全部内容" value={totalCount} />
        <StatPill label="活跃筛选" value={activeFilterCount} />
        <StatPill label="任务" value={taskCount} />
        <StatPill label="错题" value={mistakeCount} />
        <StatPill label="知识点" value={knowledgeCount} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-sage-50/85">
        {query.trim() ? (
          <>
            当前关键词：<span className="font-semibold text-white">{query.trim()}</span>
          </>
        ) : (
          "当前未输入关键词，正在按筛选条件浏览全部可见内容。"
        )}
      </div>
    </section>
  );
}
