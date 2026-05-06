import "server-only";
import type { GlobalSearchFilters } from "@/features/search/types";
import { buildUnifiedSearchRecords, filterSearchRecords } from "@/features/search/utils";
import { listKnowledgeRecords, listKnowledgeRecordsService, listMistakes, listMistakesService } from "@/lib/supabase/study-records-repository";
import { listTasks, listTasksService } from "@/lib/supabase/tasks-repository";

interface SearchRepositoryContext {
  accessToken: string;
  userId: string;
}

export async function searchSupabaseData(context: SearchRepositoryContext, filters: GlobalSearchFilters) {
  const [tasks, mistakes, knowledgeRecords] = await Promise.all([
    listTasks(context),
    listMistakes(context),
    listKnowledgeRecords(context)
  ]);

  const records = buildUnifiedSearchRecords(tasks, mistakes, knowledgeRecords);
  return filterSearchRecords(records, filters);
}

export async function searchSupabaseDataService(filters: GlobalSearchFilters) {
  const [tasks, mistakes, knowledgeRecords] = await Promise.all([
    listTasksService(),
    listMistakesService(),
    listKnowledgeRecordsService()
  ]);

  const records = buildUnifiedSearchRecords(tasks, mistakes, knowledgeRecords);
  return filterSearchRecords(records, filters);
}
