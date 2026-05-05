import Link from "next/link";
import { HomeIcon, PlusIcon, TargetIcon } from "@/components/ui/icons";

interface TaskPageHeaderProps {
  onCreate: () => void;
}

export function TaskPageHeader({ onCreate }: TaskPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <span className="soft-pill">
          <TargetIcon className="h-4 w-4" />
          任务管理
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
          用一页把今日任务和长期推进都管清楚
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          手机端优先保证快速查看和快速变更状态；平板端适合列表配详情；电脑端则补充完整的筛选和管理视图。
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
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full bg-moss-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-moss-700"
        >
          <PlusIcon className="h-4 w-4" />
          新增任务
        </button>
      </div>
    </header>
  );
}
