import { NextResponse } from "next/server";
import { requireAuthenticatedSupabaseRequest, SupabaseAuthError } from "@/lib/supabase/auth";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { removeTask, updateTask } from "@/lib/supabase/tasks-repository";
import { validateTaskPayload } from "@/lib/validation";

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
    const validation = validateTaskPayload({
      ...(await request.json()),
      id: params.id
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const updated = await updateTask(auth, validation.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "更新任务失败，请稍后再试。" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const auth = await requireAuthenticatedSupabaseRequest(request);
    await removeTask(auth, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "删除任务失败，请稍后再试。" }, { status: 500 });
  }
}
