import { NextResponse } from "next/server";
import type { GlobalSearchFilters } from "@/features/search/types";
import { defaultGlobalSearchFilters } from "@/features/search/utils";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { searchSupabaseDataService } from "@/lib/supabase/search-repository";

export async function GET(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const filters: GlobalSearchFilters = {
      ...defaultGlobalSearchFilters,
      query: url.searchParams.get("query") ?? "",
      scope: (url.searchParams.get("scope") as GlobalSearchFilters["scope"]) ?? "all",
      subjectKey: (url.searchParams.get("subjectKey") as GlobalSearchFilters["subjectKey"]) ?? "all",
      tag: (url.searchParams.get("tag") as GlobalSearchFilters["tag"]) ?? "all",
      contentType: (url.searchParams.get("contentType") as GlobalSearchFilters["contentType"]) ?? "all",
      archiveView: (url.searchParams.get("archiveView") as GlobalSearchFilters["archiveView"]) ?? "active",
      source: (url.searchParams.get("source") as GlobalSearchFilters["source"]) ?? "all",
      importance: parseImportance(url.searchParams.get("importance"))
    };

    return NextResponse.json(await searchSupabaseDataService(filters));
  } catch (error) {
    return NextResponse.json({ message: "搜索失败，请稍后再试。" }, { status: 500 });
  }
}

function parseImportance(rawValue: string | null): GlobalSearchFilters["importance"] {
  if (!rawValue || rawValue === "all") {
    return "all";
  }

  const numeric = Number(rawValue);
  return [1, 2, 3, 4, 5].includes(numeric) ? (numeric as GlobalSearchFilters["importance"]) : "all";
}
