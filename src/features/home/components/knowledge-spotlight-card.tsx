"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookIcon, RefreshIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { KnowledgeCardItem } from "@/features/home/mock-data";
import { subjectMetas } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

type SubjectKey = (typeof subjectMetas)[number]["key"];

interface KnowledgeSpotlightCardProps {
  cardsBySubject: Record<SubjectKey, KnowledgeCardItem[]>;
}

function getInitialCard(cardsBySubject: Record<SubjectKey, KnowledgeCardItem[]>, subjectKey: SubjectKey) {
  return cardsBySubject[subjectKey][0] ?? null;
}

function pickRandomCard(
  cardsBySubject: Record<SubjectKey, KnowledgeCardItem[]>,
  subjectKey: SubjectKey,
  currentId?: string
) {
  const pool = cardsBySubject[subjectKey];

  if (pool.length === 0) {
    return null;
  }

  if (pool.length === 1) {
    return pool[0];
  }

  const filteredPool = currentId ? pool.filter((item) => item.id !== currentId) : pool;
  return filteredPool[Math.floor(Math.random() * filteredPool.length)] ?? pool[0];
}

export function KnowledgeSpotlightCard({ cardsBySubject }: KnowledgeSpotlightCardProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>("math");
  const [currentCardId, setCurrentCardId] = useState<string | null>(() => getInitialCard(cardsBySubject, "math")?.id ?? null);

  const activeSubject = useMemo(
    () => subjectMetas.find((subject) => subject.key === selectedSubject),
    [selectedSubject]
  );
  const currentCard = useMemo(
    () => cardsBySubject[selectedSubject].find((card) => card.id === currentCardId) ?? cardsBySubject[selectedSubject][0] ?? null,
    [cardsBySubject, currentCardId, selectedSubject]
  );

  const switchSubject = (subjectKey: SubjectKey) => {
    setSelectedSubject(subjectKey);
    setCurrentCardId(getInitialCard(cardsBySubject, subjectKey)?.id ?? null);
  };

  const refreshCard = () => {
    const nextCard = pickRandomCard(cardsBySubject, selectedSubject, currentCard?.id);
    setCurrentCardId(nextCard?.id ?? null);
  };

  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium tracking-tight text-stone-800 dark:text-stone-100">知识点闪卡</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshCard}
            className="flex items-center gap-1.5 rounded-lg border border-sage-200/50 bg-sage-50 px-3 py-1.5 text-xs font-medium text-sage-700 transition hover:bg-sage-100/80 hover:shadow-sm dark:border-sage-700/40 dark:bg-sage-900/30 dark:text-sage-300 dark:hover:bg-sage-800/50"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            换一张
          </button>
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1 rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-sage-700"
          >
            进入知识点页
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mb-3 flex gap-1.5">
        {subjectMetas.map((subject) => {
          const isActive = subject.key === selectedSubject;

          return (
            <button
              key={subject.key}
              type="button"
              onClick={() => switchSubject(subject.key)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition",
                isActive
                  ? `${subject.accentSurfaceClass} ${subject.accentTextClass}`
                  : "bg-stone-100/50 text-stone-500 hover:bg-stone-100"
              )}
            >
              {subject.label}
            </button>
          );
        })}
      </div>

      <article className="rounded-2xl border border-stone-200/60 bg-white/50 p-4">
        {currentCard ? (
          <>
            <div className="mb-2 flex items-start justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium",
                  activeSubject?.accentSurfaceClass,
                  activeSubject?.accentTextClass
                )}
              >
                <BookIcon className="h-3 w-3" />
                {activeSubject?.label} 知识点
              </span>
            </div>

            <h3 className="mb-2 text-base font-semibold text-stone-800">{currentCard.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-stone-600">{currentCard.summary}</p>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {currentCard.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-stone-100/60 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="rounded-xl border border-sage-200/40 bg-sage-50/60 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-sage-600">复习提醒</p>
              <p className="text-xs leading-relaxed text-stone-600">{currentCard.note}</p>
              <p className="mt-2 text-[10px] text-stone-400">来源：{currentCard.source}</p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-8 text-sm leading-6 text-stone-500">
            当前科目还没有知识点记录。去知识点页补充内容后，这里会自动出现可抽取的复习卡片。
          </div>
        )}
      </article>
    </section>
  );
}
