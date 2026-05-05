import Link from "next/link";
import { ChevronRightIcon, RefreshIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function KnowledgeNotesCard() {
  return (
    <section className="panel p-5 sm:p-6 mt-4">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-lg font-medium tracking-tight text-stone-800 dark:text-stone-100">
            知识点卡片
          </h2>
          <div className="mt-3 flex gap-1.5">
            <span className="cursor-pointer rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400">
              数学
            </span>
            <span className="cursor-pointer rounded-lg bg-stone-100/80 px-2.5 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-200/60 dark:bg-stone-800/60 dark:text-stone-400 dark:hover:bg-stone-700/60">
              英语
            </span>
            <span className="cursor-pointer rounded-lg bg-stone-100/80 px-2.5 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-200/60 dark:bg-stone-800/60 dark:text-stone-400 dark:hover:bg-stone-700/60">
              408
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-sage-200/50 bg-sage-50 px-3 py-1.5 text-xs font-medium text-sage-700 transition hover:bg-sage-100/80 hover:shadow-sm dark:border-sage-700/40 dark:bg-sage-900/30 dark:text-sage-300 dark:hover:bg-sage-800/50"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            刷新
          </button>
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1 rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-sage-700"
          >
            进入知识库页
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl p-4 text-sm font-medium text-stone-800 dark:text-stone-200">
        <div className="flex font-semibold">数学考：</div>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">极限连续步：</span>
          <span className="font-serif italic font-bold">1 / (n + H(n + h_0) - 1!) + 21</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500">先先左极：</span>
          <span>f = 1 - ln(nx) - bl</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500">最初程序：</span>
          <span>(f = 1 - ln(nx) - bl 直左右极)</span>
        </div>
        <div className="flex gap-2">
          <span className="text-stone-500">Formula：</span>
          <span>(f = 1 - ln(nx) - bl 直左右极...)</span>
        </div>

        <div className="mt-3 flex gap-2">
          <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500 dark:bg-stone-800 dark:text-stone-400">#极限</span>
          <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500 dark:bg-stone-800 dark:text-stone-400">#基本概念</span>
          <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500 dark:bg-stone-800 dark:text-stone-400">#易错</span>
        </div>
      </div>
    </section>
  );
}
