import { FilterField, FilterInput, FilterPanel, FilterSelect } from "@/components/shared/filter-panel";
import { SearchIcon } from "@/components/ui/icons";
import { archiveViewOptions, taskBucketOptions, taskStatusOptions } from "@/features/tasks/mock-data";
import type { TaskFilters } from "@/features/tasks/types";
import { subjectMetas } from "@/lib/constants/subjects";

interface TaskFilterPanelProps {
  filters: TaskFilters;
  resultCount: number;
  totalCount: number;
  onChange: (nextFilters: TaskFilters) => void;
  onReset: () => void;
}

export function TaskFilterPanel({ filters, resultCount, totalCount, onChange, onReset }: TaskFilterPanelProps) {
  return (
    <FilterPanel
      title="筛选与视图"
      subtitle={`当前命中 ${resultCount} / ${totalCount} 条任务`}
      badgeLabel="基础筛选"
      onReset={onReset}
    >
      <FilterField label="搜索任务" icon={<SearchIcon className="h-4 w-4" />}>
        <FilterInput
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="按任务名、说明或截止提示筛选"
        />
      </FilterField>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <FilterField label="任务范围">
          <FilterSelect
            value={filters.bucket}
            onChange={(event) => onChange({ ...filters, bucket: event.target.value as TaskFilters["bucket"] })}
          >
            {taskBucketOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="科目">
          <FilterSelect
            value={filters.subjectKey}
            onChange={(event) => onChange({ ...filters, subjectKey: event.target.value as TaskFilters["subjectKey"] })}
          >
            <option value="all">全部科目</option>
            {subjectMetas.map((subject) => (
              <option key={subject.key} value={subject.key}>
                {subject.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="状态">
          <FilterSelect
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFilters["status"] })}
          >
            <option value="all">全部状态</option>
            {taskStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField label="归档视图">
          <FilterSelect
            value={filters.archiveView}
            onChange={(event) => onChange({ ...filters, archiveView: event.target.value as TaskFilters["archiveView"] })}
          >
            {archiveViewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
      </div>
    </FilterPanel>
  );
}
