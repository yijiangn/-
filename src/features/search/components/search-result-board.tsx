import { SectionCard } from "@/components/ui/section-card";
import { SearchResultCard } from "@/features/search/components/search-result-card";
import type { UnifiedSearchRecord } from "@/features/search/types";
import { buildSearchSections } from "@/features/search/utils";

interface SearchResultBoardProps {
  records: UnifiedSearchRecord[];
  selectedRecordId: string | null;
  onSelect: (recordId: string) => void;
}

export function SearchResultBoard({ records, selectedRecordId, onSelect }: SearchResultBoardProps) {
  const sections = buildSearchSections(records);

  return (
    <SectionCard
      title="搜索结果"
      subtitle="按内容类型分组浏览，优先处理最近更新且仍有效的记录"
      action={<span className="soft-pill">{records.length} 条</span>}
      className="min-h-[520px]"
    >
      {records.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-sage-200 bg-sage-50/60 px-5 py-12 text-center">
          <p className="text-base font-medium text-stone-800">没有匹配的内容</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">可以减少筛选条件，或切换为“显示全部”后再搜索。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.kind} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-stone-800">{section.label}</h3>
                <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-medium text-stone-500">
                  {section.records.length} 条
                </span>
              </div>
              <div className="space-y-3">
                {section.records.map((record) => (
                  <SearchResultCard key={record.id} record={record} isSelected={record.id === selectedRecordId} onSelect={onSelect} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
