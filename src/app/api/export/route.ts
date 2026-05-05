import { NextResponse } from "next/server";
import type { ExportConfig } from "@/features/data-management/types";
import {
  buildCsvExport,
  buildExportRecords,
  buildMarkdownExport
} from "@/features/data-management/utils";
import { requireAuthenticatedSupabaseRequest, SupabaseAuthError } from "@/lib/supabase/auth";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { listKnowledgeRecords, listMistakes } from "@/lib/supabase/study-records-repository";
import { listTasks } from "@/lib/supabase/tasks-repository";

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const auth = await requireAuthenticatedSupabaseRequest(request);
    const config = (await request.json()) as ExportConfig;
    const [tasks, mistakes, knowledge] = await Promise.all([
      listTasks(auth),
      listMistakes(auth),
      listKnowledgeRecords(auth)
    ]);
    const records = buildExportRecords({ tasks, mistakes, knowledge }, config.filters);
    const content = config.format === "markdown"
      ? buildMarkdownExport(records, config.filters)
      : buildCsvExport(records);
    const extension = config.format === "markdown" ? "md" : "csv";
    const contentType =
      config.format === "markdown" ? "text/markdown; charset=utf-8" : "text/csv; charset=utf-8";
    const fileName = `${sanitizeFileName(config.fileName || "kaoyan-study-export")}.${extension}`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
      }
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "导出失败，请稍后再试。" }, { status: 500 });
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.trim().replace(/[\\/:*?"<>|]/g, "-") || "kaoyan-study-export";
}
