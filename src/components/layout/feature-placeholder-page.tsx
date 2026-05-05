import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

interface FeaturePlaceholderPageProps {
  title: string;
  description: string;
}

export function FeaturePlaceholderPage({
  title,
  description
}: FeaturePlaceholderPageProps) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <section className="panel w-full p-8 sm:p-10">
          <span className="soft-pill">页面占位</span>
          <h1 className="mt-5 text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-moss-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-moss-700"
            >
              返回首页
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <span className="soft-pill">后续可在这里接入真实任务、错题和知识点模块</span>
          </div>
        </section>
      </div>
    </main>
  );
}
