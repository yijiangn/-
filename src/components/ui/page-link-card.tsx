import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface PageLinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accentClassName: string;
}

export function PageLinkCard({
  href,
  title,
  description,
  icon,
  accentClassName
}: PageLinkCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200/80 bg-white/75 p-4 shadow-float transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-slate-700",
            accentClassName
          )}
        >
          {icon}
        </span>
        <ArrowRightIcon className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
      </div>
      <div className="mt-4">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
