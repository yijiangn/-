import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListDetailLayoutProps {
  sidebar: ReactNode;
  list: ReactNode;
  detail: ReactNode;
  className?: string;
  sidebarClassName?: string;
  mainClassName?: string;
  contentClassName?: string;
  detailWidthClassName?: string;
}

export function ListDetailLayout({
  sidebar,
  list,
  detail,
  className,
  sidebarClassName,
  mainClassName,
  contentClassName,
  detailWidthClassName = "lg:grid-cols-[minmax(0,1fr)_360px]"
}: ListDetailLayoutProps) {
  return (
    <div className={cn("grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]", className)}>
      <aside className={cn("space-y-4 xl:sticky xl:top-6 xl:self-start", sidebarClassName)}>{sidebar}</aside>

      <div className={cn("grid gap-4", detailWidthClassName, mainClassName)}>
        <div className={contentClassName}>{list}</div>
        <div>{detail}</div>
      </div>
    </div>
  );
}

