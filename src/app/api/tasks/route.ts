import { NextResponse } from "next/server";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { insertTaskService, listTasksService } from "@/lib/supabase/tasks-repository";
import { validateTaskPayload } from "@/lib/validation";

export async function GET() {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const tasks = await listTasksService();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: "读取任务列表失败，请稍后再试。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const validation = validateTaskPayload(await request.json());

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const created = await insertTaskService(validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "创建任务失败，请稍后再试。" }, { status: 500 });
  }
}
