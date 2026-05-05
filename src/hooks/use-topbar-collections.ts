"use client";

import { useCallback, useEffect, useState } from "react";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask } from "@/features/tasks/types";
import { normalizeTask } from "@/features/tasks/utils";
import { getLocalCollection, localDataKeys } from "@/lib/local-data";

function readCollections() {
  return {
    tasks: getLocalCollection<StudyTask>(localDataKeys.tasks, []).map(normalizeTask),
    mistakes: getLocalCollection<MistakeRecord>(localDataKeys.mistakes, []),
    knowledge: getLocalCollection<KnowledgeRecord>(localDataKeys.knowledge, [])
  };
}

export function useTopbarCollections() {
  const [collections, setCollections] = useState<ReturnType<typeof readCollections>>({
    tasks: [],
    mistakes: [],
    knowledge: []
  });

  const refreshCollections = useCallback(() => {
    setCollections(readCollections());
  }, []);

  useEffect(() => {
    refreshCollections();

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === localDataKeys.tasks ||
        event.key === localDataKeys.mistakes ||
        event.key === localDataKeys.knowledge
      ) {
        refreshCollections();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(`${localDataKeys.tasks}-updated`, refreshCollections);
    window.addEventListener(`${localDataKeys.mistakes}-updated`, refreshCollections);
    window.addEventListener(`${localDataKeys.knowledge}-updated`, refreshCollections);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(`${localDataKeys.tasks}-updated`, refreshCollections);
      window.removeEventListener(`${localDataKeys.mistakes}-updated`, refreshCollections);
      window.removeEventListener(`${localDataKeys.knowledge}-updated`, refreshCollections);
    };
  }, [refreshCollections]);

  return {
    ...collections,
    refreshCollections
  };
}
