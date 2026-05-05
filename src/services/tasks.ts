import type { StudyTask } from "@/features/tasks/types";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { requestJson } from "@/services/request-json";
import { ApiRequestError } from "@/services/request-json";

export async function listTasksFromApi() {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置", 503);
  }

  return requestJson<StudyTask[]>("/api/tasks", {
    cache: "no-store"
  });
}

export async function createTaskInApi(task: StudyTask) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置", 503);
  }

  return requestJson<StudyTask>("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });
}

export async function updateTaskInApi(task: StudyTask) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置", 503);
  }

  return requestJson<StudyTask>(`/api/tasks/${task.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });
}

export async function deleteTaskInApi(taskId: string) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置", 503);
  }

  await requestJson<{ success: boolean }>(`/api/tasks/${taskId}`, {
    method: "DELETE"
  });
}
