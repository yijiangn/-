import { NextResponse } from "next/server";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { removeTaskService, updateTaskService } from "@/lib/supabase/tasks-repository";
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
    const validation = validateTaskPayload({
      ...(await request.json()),
      id: params.id
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const updated = await updateTaskService(validation.data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "更新任务失败，请稍后再试。" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    await removeTaskService(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "删除任务失败，请稍后再试。" }, { status: 500 });
  }
}
