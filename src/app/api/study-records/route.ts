import { NextResponse } from "next/server";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { insertKnowledgeService, insertMistakeService, listKnowledgeRecordsService, listMistakesService } from "@/lib/supabase/study-records-repository";
import { validateKnowledgeRecord, validateMistakeRecord } from "@/lib/validation";

export async function GET(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const recordType = url.searchParams.get("recordType");

    if (recordType === "knowledge") {
      return NextResponse.json(await listKnowledgeRecordsService());
    }

    return NextResponse.json(await listMistakesService());
  } catch (error) {
    return NextResponse.json({ message: "读取学习记录失败，请稍后再试。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as {
      recordType: "mistake" | "knowledge";
      record: unknown;
    };

    if (payload.recordType === "knowledge") {
      const validation = validateKnowledgeRecord(payload.record);

      if (!validation.success) {
        return NextResponse.json({ message: validation.message }, { status: 400 });
      }

      const created = await insertKnowledgeService(validation.data);
      return NextResponse.json(created, { status: 201 });
    }

    const validation = validateMistakeRecord(payload.record);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const created = await insertMistakeService(validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "创建学习记录失败，请稍后再试。" }, { status: 500 });
  }
}
