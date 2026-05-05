import { CalendarIcon, SparklesIcon, SunIcon } from "@/components/ui/icons";

const studyTips = [
  "记忆宫殿法：在熟悉的心智空间中构建信息结构。",
  "费曼技巧：如果你不能简单地解释它，说明你还不够理解。",
  "番茄工作法：25 分钟专注 + 5 分钟休息，循环叠加。",
  "间隔重复：在遗忘即将发生前复习，效果最好。"
];

function getTodayTip() {
  const dayIndex = new Date().getDate() % studyTips.length;
  return studyTips[dayIndex];
}

function formatBannerDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function HeroBanner() {
  const tip = getTodayTip();
  const today = new Date();

  return (
    <section className="sticky top-4 z-20 lg:top-[76px] relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-stone-200/60 px-6 py-4 shadow-sm transition-all hover:bg-white/80">
      {/* 磨砂装饰光斑 */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sage-300/10 blur-2xl flex-shrink-0" />

      <div className="relative flex items-center justify-between gap-4">
        {/* 左侧：格言 */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="shrink-0 rounded-xl border border-sage-200/60 bg-sage-50/80 p-2 text-sage-600 shadow-sm">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-sage-600">今日格言</p>
            <p className="truncate text-sm font-medium text-stone-700">
              {tip}
            </p>
          </div>
        </div>

        {/* 右侧：日期 + 天气 */}
        <div className="flex shrink-0 items-center gap-4 border-l border-sage-200/50 pl-4">
          <div className="flex items-center gap-1.5 text-stone-600">
            <CalendarIcon className="h-4 w-4 text-sage-500" />
            <span className="text-sm font-medium">
              {formatBannerDate(today)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <SunIcon className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-stone-700">28°C</span>
          </div>
        </div>
      </div>
    </section>
  );
}
