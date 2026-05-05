import { MoreHorizontalIcon } from "@/components/ui/icons";

interface SubjectProgressItem {
  key: string;
  name: string;
  percent: number;
  colorClassName: string;
}

interface StudyProgressCardProps {
  subjects: SubjectProgressItem[];
  streakDays?: number;
  monthDays?: number;
  weekDays?: number;
}

export function StudyProgressCard({ 
  subjects, 
  streakDays = 0,
  monthDays = 0,
  weekDays = 0
}: StudyProgressCardProps) {
  return (
    <section className="flex h-full flex-col gap-4">
      {/* 学习进度列表 - 局部毛玻璃 */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-medium tracking-tight text-stone-800 dark:text-stone-100">学习进度</h2>
          <button className="p-1 text-stone-400 transition hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300">
            <MoreHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.key}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">{subject.name}</span>
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{subject.percent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-stone-100/80 dark:bg-stone-700/50 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${subject.colorClassName}`}
                  style={{ width: `${subject.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计数据 - 局部毛玻璃 */}
      <div className="panel mt-auto flex flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            本周学习
          </span>
          <div className="flex items-center gap-1.5">
             <span className="text-sm font-bold text-sage-600 dark:text-sage-400">{weekDays}</span>
             <span className="text-[10px] text-stone-400">天</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            本月统计
          </span>
          <div className="flex items-center gap-1.5">
             <span className="text-sm font-bold text-sage-600 dark:text-sage-400">{monthDays}</span>
             <span className="text-[10px] text-stone-400">天</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-sage-50/50 dark:bg-sage-900/20 px-3 py-2">
          <span className="text-xs font-semibold text-sage-700 dark:text-sage-300">
            当前连续学习
          </span>
          <span className="text-sm font-black text-sage-600 dark:text-sage-400">
            {streakDays} DAYS
          </span>
        </div>
      </div>
    </section>
  );
}
