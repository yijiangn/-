import { CalendarIcon } from "@/components/ui/icons";
import { SectionCard } from "@/components/ui/section-card";
import { buildCalendar, formatLongDate, formatMonthLabel, weekHeaders } from "@/features/home/utils/date";
import { cn } from "@/lib/utils";

export function DatePanel() {
  const today = new Date();
  const calendarCells = buildCalendar(today);

  return (
    <SectionCard
      title="日期与日历"
      subtitle={formatLongDate(today)}
      action={
        <span className="soft-pill">
          <CalendarIcon className="h-4 w-4" />
          本月视图
        </span>
      }
      className="h-full"
    >
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div>
            <p className="text-sm font-medium text-emerald-700">{formatMonthLabel(today)}</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-slate-900">{today.getDate()}</p>
          </div>
          <div className="rounded-3xl bg-white/80 px-4 py-3 text-right shadow-float">
            <p className="text-sm text-slate-500">今日建议</p>
            <p className="mt-1 text-sm font-medium text-slate-900">先做主任务，再补记录整理</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400">
            {weekHeaders.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
            {calendarCells.map((cell) => (
              <span
                key={cell.iso}
                className={cn(
                  "flex h-10 items-center justify-center rounded-2xl transition",
                  cell.isToday
                    ? "bg-moss-800 text-white shadow-float"
                    : cell.isCurrentMonth
                      ? "bg-slate-50 text-slate-700"
                      : "text-slate-300"
                )}
              >
                {cell.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
