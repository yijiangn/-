import Link from "next/link";
import { FileTextIcon, LayersIcon, NoteIcon, TargetIcon, TrendIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/tasks", label: "任务页", desc: "查看今日任务", icon: TargetIcon, accent: "text-sage-700 bg-sage-50 border-sage-200/50" },
  { href: "/mistakes", label: "错题页", desc: "记录错题内容", icon: NoteIcon, accent: "text-moss-800 bg-moss-50 border-moss-200/50" },
  { href: "/knowledge", label: "知识点页", desc: "回顾知识内容", icon: LayersIcon, accent: "text-moss-700 bg-sage-50 border-moss-300/50" },
  { href: "/stats", label: "统计页", desc: "查看学习趋势", icon: TrendIcon, accent: "text-sage-700 bg-moss-50 border-sage-200/50" },
  { href: "/data", label: "数据管理", desc: "导入导出数据", icon: FileTextIcon, accent: "text-moss-700 bg-moss-100 border-moss-300/50" }
];

export function QuickAccessCard() {
  return (
    <section className="panel h-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium tracking-tight text-stone-800">快速导航</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-transparent p-3 text-center transition-all hover:border-white/80 hover:bg-white/60 hover:shadow-sm"
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", item.accent)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium leading-tight text-stone-700">{item.label}</span>
              <span className="hidden text-[10px] leading-tight text-stone-400 sm:block">{item.desc}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
