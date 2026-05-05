import Link from "next/link";
import { HomeIcon, TrendIcon } from "@/components/ui/icons";

export function StatsPageHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <span className="soft-pill">
          <TrendIcon className="h-4 w-4" />
          学习统计
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
          用热力图和趋势线看清最近的学习活跃度
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          统计口径先围绕任务完成情况和学习记录数量展开，优先帮助你判断最近有没有稳定推进，而不是做复杂分析模型。
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
        >
          <HomeIcon className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    </header>
  );
}
