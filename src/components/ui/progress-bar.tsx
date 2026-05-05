import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 rounded-full bg-sage-100/80", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-sage-500 to-sage-400 transition-all duration-500",
          barClassName
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
