import "server-only";
import { mapDbRowToTask, mapTaskToDbRow } from "@/lib/supabase/mappers";
import { supabaseUserRestRequest } from "@/lib/supabase/rest";
import type { StudyTask } from "@/features/tasks/types";
import type { DbTaskRow } from "@/types/database";

interface TaskRepositoryContext {
  accessToken: string;
  userId: string;
}

export async function listTaskRows(context: TaskRepositoryContext) {
  return supabaseUserRestRequest<DbTaskRow[]>("tasks", context.accessToken, {
    searchParams: {
      select: "*",
      user_id: `eq.${context.userId}`,
      order: "created_at.desc"
    }
  });
}

export async function listTasks(context: TaskRepositoryContext) {
  const rows = await listTaskRows(context);
  return rows.map(mapDbRowToTask);
}

export async function insertTask(context: TaskRepositoryContext, task: StudyTask) {
  const [row] = await supabaseUserRestRequest<DbTaskRow[]>("tasks", context.accessToken, {
    method: "POST",
    body: {
      ...mapTaskToDbRow(task),
      user_id: context.userId
    },
    preferRepresentation: true
  });

  return mapDbRowToTask(row);
}

export async function updateTask(context: TaskRepositoryContext, task: StudyTask) {
  const [row] = await supabaseUserRestRequest<DbTaskRow[]>("tasks", context.accessToken, {
    method: "PATCH",
    searchParams: {
      id: `eq.${task.id}`,
      user_id: `eq.${context.userId}`
    },
    body: {
      ...mapTaskToDbRow(task),
      user_id: context.userId
    },
    preferRepresentation: true
  });

  return mapDbRowToTask(row);
}

export async function removeTask(context: TaskRepositoryContext, taskId: string) {
  await supabaseUserRestRequest("tasks", context.accessToken, {
    method: "DELETE",
    searchParams: {
      id: `eq.${taskId}`,
      user_id: `eq.${context.userId}`
    }
  });
}
