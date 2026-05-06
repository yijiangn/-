import { NextResponse } from "next/server";
import type { ImportPreviewItem } from "@/features/data-management/types";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { insertKnowledgeService, insertMistakeService } from "@/lib/supabase/study-records-repository";
import { insertTaskService } from "@/lib/supabase/tasks-repository";
import {
  validateKnowledgeRecord,
  validateMistakeRecord,
  validateTaskPayload
} from "@/lib/validation";

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as { previewItems?: ImportPreviewItem[] };
    const previewItems = Array.isArray(payload.previewItems) ? payload.previewItems : [];
    let importedCount = 0;

    for (const item of previewItems) {
      if (!item?.payload) {
        continue;
      }

      if (item.target === "task") {
        const validation = validateTaskPayload(item.payload);
        if (!validation.success) {
          continue;
        }
        await insertTaskService(validation.data);
        importedCount += 1;
        continue;
      }

      if (item.target === "mistake") {
        const validation = validateMistakeRecord(item.payload);
        if (!validation.success) {
          continue;
        }
        await insertMistakeService(validation.data);
        importedCount += 1;
        continue;
      }

      const validation = validateKnowledgeRecord(item.payload);
      if (!validation.success) {
        continue;
      }
      await insertKnowledgeService(validation.data);
      importedCount += 1;
    }

    return NextResponse.json({ importedCount });
  } catch (error) {
    return NextResponse.json({ message: "导入提交失败，请稍后再试。" }, { status: 500 });
  }
}
