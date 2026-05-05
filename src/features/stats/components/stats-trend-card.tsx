import type { TrendPoint } from "@/features/stats/types";

interface StatsTrendCardProps {
  points: TrendPoint[];
  rangeLabel: string;
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const CHART_PADDING = { top: 16, right: 18, bottom: 36, left: 18 };

export function StatsTrendCard({ points, rangeLabel }: StatsTrendCardProps) {
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const maxValue = Math.max(...points.flatMap((point) => [point.activityScore, point.studyRecords]), 1);

  const activityPath = buildPath(points, (point) => point.activityScore, maxValue, plotWidth, plotHeight);
  const recordPath = buildPath(points, (point) => point.studyRecords, maxValue, plotWidth, plotHeight);
  const activityFill = `${activityPath} L ${CHART_PADDING.left + plotWidth} ${CHART_PADDING.top + plotHeight} L ${CHART_PADDING.left} ${CHART_PADDING.top + plotHeight} Z`;

  const totalCompleted = points.reduce((sum, point) => sum + point.completedTasks, 0);
  const totalRecords = points.reduce((sum, point) => sum + point.studyRecords, 0);

  return (
    <div className="panel border-white/40 bg-white/30 p-5 dark:border-stone-700/50 dark:bg-stone-900/40">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black text-stone-950 dark:text-stone-100">趋势折线图</h2>
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400">{rangeLabel}</p>
        </div>
        {/* Inline mini-stats */}
        <div className="flex flex-wrap gap-2">
          <MiniStat label="最近一天活跃" value={points[points.length - 1]?.activityScore ?? 0} color="text-sage-700 dark:text-sage-400 bg-sage-50/60 dark:bg-sage-900/30 border-sage-200/60 dark:border-sage-900/40" />
          <MiniStat label="14天沉淀记录" value={totalRecords} color="text-sky-700 dark:text-sky-400 bg-sky-50/60 dark:bg-sky-900/30 border-sky-200/60 dark:border-sky-900/40" />
          <MiniStat label="14天完成任务" value={totalCompleted} color="text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-900/40" />
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/50 bg-white/30 p-3 dark:border-stone-700/40 dark:bg-stone-900/30">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-auto w-full">
          <defs>
            <linearGradient id="activityFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b9e7a" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#6b9e7a" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((tick) => {
            const y = CHART_PADDING.top + (plotHeight / 4) * tick;
            return (
              <line
                key={tick}
                x1={CHART_PADDING.left}
                y1={y}
                x2={CHART_PADDING.left + plotWidth}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 6"
                className="text-stone-500"
              />
            );
          })}

          <path d={activityFill} fill="url(#activityFillGrad)" />
          <path d={activityPath} fill="none" stroke="#6b9e7a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={recordPath} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />

          {points.map((point, index) => {
            const x = getX(index, points.length, plotWidth);
            const activityY = getY(point.activityScore, maxValue, plotHeight);
            const recordY = getY(point.studyRecords, maxValue, plotHeight);
            const showLabel = index === 0 || index === points.length - 1 || index % 3 === 0;

            return (
              <g key={point.dateKey}>
                <circle cx={x} cy={activityY} r="4" fill="#6b9e7a" />
                <circle cx={x} cy={recordY} r="3" fill="#60a5fa" />
                {showLabel ? (
                  <text x={x} y={CHART_HEIGHT - 8} textAnchor="middle" fontSize="10" fill="#78716c">
                    {point.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-stone-500 dark:text-stone-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-5 rounded-full bg-[#6b9e7a]" />
          活跃度主线
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 bg-[#60a5fa]" style={{ borderTop: "2px dashed #60a5fa", background: "none" }} />
          新增学习记录
        </span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 backdrop-blur-sm ${color}`}>
      <span className="text-[10px] font-bold opacity-80">{label}</span>
      <span className="text-base font-black tabular-nums">{value}</span>
    </div>
  );
}

function buildPath(
  points: TrendPoint[],
  getValue: (point: TrendPoint) => number,
  maxValue: number,
  plotWidth: number,
  plotHeight: number
) {
  return points
    .map((point, index) => {
      const x = getX(index, points.length, plotWidth);
      const y = getY(getValue(point), maxValue, plotHeight);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getX(index: number, total: number, plotWidth: number) {
  if (total <= 1) return CHART_PADDING.left + plotWidth / 2;
  return CHART_PADDING.left + (plotWidth / (total - 1)) * index;
}

function getY(value: number, maxValue: number, plotHeight: number) {
  return CHART_PADDING.top + plotHeight - (value / maxValue) * plotHeight;
}
