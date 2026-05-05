import Link from "next/link";
import { HomeIcon, SearchIcon } from "@/components/ui/icons";

export function SearchPageHeader() {
  return (
    <header className="rounded-[28px] border border-white/45 bg-white/35 p-5 shadow-float backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <span className="soft-pill">
            <SearchIcon className="h-4 w-4" />
            全局搜索
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl xl:text-5xl">
            一次搜索任务、错题和知识点
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
            用同一套筛选条件回找学习内容。手机端优先快速检索，平板和电脑端保持左侧筛选、中间结果、右侧详情的稳定布局。
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
          >
            <HomeIcon className="h-4 w-4" />
            返回首页
          </Link>
          <span className="soft-pill">任务 / 错题 / 知识点统一检索</span>
        </div>
      </div>
    </header>
  );
}
