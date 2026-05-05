import { CalendarIcon } from "@/components/ui/icons";
import type { HeatmapWeek } from "@/features/stats/types";
import { getWeekdayLabels } from "@/features/stats/utils";

interface StatsHeatmapCardProps {
  weeks: HeatmapWeek[];
  rangeLabel: string;
}

const heatLevelClassMap = {
  0: "bg-stone-200/60 dark:bg-stone-800/60",
  1: "bg-sage-200 dark:bg-sage-900",
  2: "bg-sage-300 dark:bg-sage-700",
  3: "bg-sage-500 dark:bg-sage-500",
  4: "bg-sage-700 dark:bg-sage-400"
} as const;

export function StatsHeatmapCard({ weeks, rangeLabel }: StatsHeatmapCardProps) {
  const weekdayLabels = getWeekdayLabels();

  return (
    <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">每日热力图</h2>
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400">{rangeLabel}</p>
        </div>
        <span className="soft-pill">
          <CalendarIcon className="h-3.5 w-3.5" />
          最近 12 周
        </span>
      </div>

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3">
            <div className="grid grid-rows-7 gap-2 pt-7 text-xs text-stone-400 dark:text-stone-500">
              {weekdayLabels.map((label) => (
                <span key={label} className="flex h-4 items-center">
                  {label}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              <div className="grid grid-flow-col gap-2 text-[11px] text-stone-400 dark:text-stone-500">
                {weeks.map((week, index) => (
                  <span key={`${week.weekLabel}-${index}`} className="w-4 text-center">
                    {index === 0 || week.weekLabel !== weeks[index - 1]?.weekLabel ? week.weekLabel : ""}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                {weeks.map((week, weekIndex) => (
                  <div key={`${week.weekLabel}-${weekIndex}`} className="grid grid-rows-7 gap-2">
                    {week.days.map((day) => (
                      <div
                        key={day.dateKey}
                        title={`${day.label}｜任务 ${day.completedTasks}｜记录 ${day.studyRecords}｜活跃 ${day.activityScore}`}
                        className={[
                          "h-4 w-4 rounded-[5px] border border-white/50 shadow-sm transition-transform hover:scale-125",
                          heatLevelClassMap[day.heatLevel]
                        ].join(" ")}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>低</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={[
                  "h-3.5 w-3.5 rounded-[4px] border border-white/50",
                  heatLevelClassMap[level as keyof typeof heatLevelClassMap]
                ].join(" ")}
              />
            ))}
            <span>高</span>
          </div>
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
            热度越深，当天任务完成或记录沉淀越多。
          </p>
        </div>
      </div>
    </div>
  );
}
