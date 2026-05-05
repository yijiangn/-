import { NextResponse } from "next/server";
import { requireAuthenticatedSupabaseRequest, SupabaseAuthError } from "@/lib/supabase/auth";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { insertTask, listTasks } from "@/lib/supabase/tasks-repository";
import { validateTaskPayload } from "@/lib/validation";

export async function GET(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const auth = await requireAuthenticatedSupabaseRequest(request);
    const tasks = await listTasks(auth);
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "读取任务列表失败，请稍后再试。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const auth = await requireAuthenticatedSupabaseRequest(request);
    const validation = validateTaskPayload(await request.json());

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const created = await insertTask(auth, validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "创建任务失败，请稍后再试。" }, { status: 500 });
  }
}
