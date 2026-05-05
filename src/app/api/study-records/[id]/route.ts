import { NextResponse } from "next/server";
import { requireAuthenticatedSupabaseRequest, SupabaseAuthError } from "@/lib/supabase/auth";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { removeStudyRecord, updateKnowledge, updateMistake } from "@/lib/supabase/study-records-repository";
import { validateKnowledgeRecord, validateMistakeRecord } from "@/lib/validation";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const auth = await requireAuthenticatedSupabaseRequest(request);
    const payload = (await request.json()) as {
      recordType: "mistake" | "knowledge";
      record: unknown;
    };

    if (payload.recordType === "knowledge") {
      const validation = validateKnowledgeRecord({
        ...(payload.record as Record<string, unknown>),
        id: params.id
      });

      if (!validation.success) {
        return NextResponse.json({ message: validation.message }, { status: 400 });
      }

      const updated = await updateKnowledge(auth, validation.data);
      return NextResponse.json(updated);
    }

    const validation = validateMistakeRecord({
      ...(payload.record as Record<string, unknown>),
      id: params.id
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const updated = await updateMistake(auth, validation.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "更新学习记录失败，请稍后再试。" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const auth = await requireAuthenticatedSupabaseRequest(request);
    await removeStudyRecord(auth, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "删除学习记录失败，请稍后再试。" }, { status: 500 });
  }
}
