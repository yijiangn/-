import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  action,
  className,
  contentClassName,
  children
}: SectionCardProps) {
  return (
    <section className={cn("h-full p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium text-stone-800 tracking-tight dark:text-stone-100">{title}</h2>
          {subtitle ? <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </section>
  );
}
