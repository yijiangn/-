import { getClientAuthHeaders } from "@/lib/supabase/client-auth";
import type { GlobalSearchFilters, UnifiedSearchRecord } from "@/features/search/types";

export async function searchRecordsFromApi(filters: GlobalSearchFilters) {
  const query = new URLSearchParams({
    query: filters.query,
    scope: filters.scope,
    subjectKey: filters.subjectKey,
    tag: filters.tag,
    contentType: filters.contentType,
    archiveView: filters.archiveView,
    source: filters.source,
    importance: String(filters.importance)
  });

  const response = await fetch(`/api/search?${query.toString()}`, {
    cache: "no-store",
    headers: getClientAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as UnifiedSearchRecord[];
}
