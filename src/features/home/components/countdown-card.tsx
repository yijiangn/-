import { SparklesIcon, SunIcon, TargetIcon } from "@/components/ui/icons";
import { ProgressRing } from "@/components/ui/progress-ring";
import { examInfo } from "@/features/home/mock-data";
import { calculateDaysUntil } from "@/features/home/utils/date";

interface CountdownCardProps {
  taskProgressPercent: number;
  overallProgressPercent: number;
  streakDays: number;
}

const studyTips = [
  "记忆宫殿法：在熟悉的心智空间中构建信息结构。",
  "费曼技巧：如果你不能简单地解释它，说明你还不够理解。",
  "番茄工作法：25 分钟专注 + 5 分钟休息，循环叠加。",
  "间隔重复：在遗忘即将发生前复习，效果最好。"
];

function formatBannerDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function CountdownCard({
  taskProgressPercent,
  overallProgressPercent,
  streakDays
}: CountdownCardProps) {
  const daysLeft = calculateDaysUntil(examInfo.targetDate);
  const tip = studyTips[new Date().getDate() % studyTips.length];
  const today = new Date();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-sage-800/20 bg-gradient-to-r from-sage-800 via-sage-700 to-sage-600 px-6 py-5 text-white shadow-sm">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-sage-400/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        {/* 左侧：氛围问候与格言 */}
        <div className="flex flex-col gap-2 lg:w-1/3 min-w-[240px]">
          <div className="flex items-center gap-1.5 text-sage-200">
             <SparklesIcon className="h-4 w-4" />
             <span className="text-[10px] font-bold tracking-widest uppercase">今日格言</span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-white/95">
             {tip}
          </p>
        </div>

        {/* 中间：倒计时核心数据 */}
        <div className="flex flex-1 items-center justify-between lg:justify-center gap-6 border-y border-white/10 py-4 lg:border-x lg:border-y-0 lg:py-0 lg:px-8">
           <div className="shrink-0">
             <div className="mb-1 text-[11px] font-medium tracking-wider text-sage-200/80 flex items-center gap-1">
                <TargetIcon className="h-3 w-3" />
                考研倒计时
             </div>
             <div className="flex items-end gap-1.5">
               <span className="font-serif text-4xl font-bold leading-none tracking-tight">{daysLeft}</span>
               <span className="pb-0.5 text-sm font-medium text-sage-200/80">天</span>
             </div>
           </div>
           
           <div className="flex items-center gap-4 shrink-0">
             <div className="flex flex-col items-center gap-1.5">
               <ProgressRing value={taskProgressPercent} size={42} strokeWidth={4} />
               <span className="text-[10px] font-medium text-sage-200/80">今日进度</span>
             </div>
             <div className="flex flex-col items-center gap-1.5">
               <ProgressRing value={overallProgressPercent} size={42} strokeWidth={4} label={`${overallProgressPercent}%`} />
               <span className="text-[10px] font-medium text-sage-200/80">总体进度</span>
             </div>
           </div>
        </div>

        {/* 右侧：日期与活跃信息 */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 lg:w-1/4 shrink-0">
           <div className="flex items-center gap-2 text-sm font-semibold tracking-wider">
             <span>{formatBannerDate(today)}</span>
             <SunIcon className="h-4 w-4 text-amber-400" />
           </div>
           <div className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/5 px-3 py-1 text-xs backdrop-blur-md shadow-sm">
             <span className="text-sage-200 font-medium">连续学习</span>
             <span className="font-bold tabular-nums text-white">{streakDays} 天</span>
             <span className="text-amber-400">🔥</span>
           </div>
        </div>
      </div>
    </section>
  );
}
