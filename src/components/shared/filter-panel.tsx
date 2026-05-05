import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { FilterIcon } from "@/components/ui/icons";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  title: string;
  subtitle: string;
  badgeLabel?: string;
  className?: string;
  children: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
}

export function FilterPanel({
  title,
  subtitle,
  badgeLabel = "基础筛选",
  className,
  children,
  onReset,
  resetLabel = "重置筛选"
}: FilterPanelProps) {
  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      action={
        <span className="soft-pill">
          <FilterIcon className="h-4 w-4" />
          {badgeLabel}
        </span>
      }
      className={cn("h-full", className)}
    >
      <div className="space-y-4">
        {children}
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-2xl border border-white/60 bg-white/40 px-4 py-3 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-white/60 dark:border-stone-700/50 dark:bg-stone-800/40 dark:text-stone-300 dark:hover:bg-stone-700/50"
          >
            {resetLabel}
          </button>
        ) : null}
      </div>
    </SectionCard>
  );
}

interface FilterFieldProps {
  label: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FilterField({ label, icon, className, children }: FilterFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-2 text-sm font-black text-stone-900 dark:text-stone-200">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

const filterControlClassName =
  "w-full rounded-2xl border border-white/60 bg-white/40 px-4 py-3 text-sm font-bold text-stone-900 shadow-sm outline-none transition placeholder:text-stone-600 focus:border-sage-400 focus:bg-white/70 dark:border-stone-700/50 dark:bg-stone-900/50 dark:text-stone-200 dark:focus:bg-stone-800/80";

export function FilterInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(filterControlClassName, props.className)} />;
}

export function FilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(filterControlClassName, props.className)} />;
}
