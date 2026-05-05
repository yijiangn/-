import { getClientAuthHeaders } from "@/lib/supabase/client-auth";
import type { ExportConfig, ImportPreviewItem, ImportTarget } from "@/features/data-management/types";
import { ApiRequestError } from "@/services/request-json";

export async function requestExportFile(config: ExportConfig) {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getClientAuthHeaders()
    },
    body: JSON.stringify(config)
  });

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  return response.blob();
}

export async function requestImportPreview(target: ImportTarget, textInput: string, files: File[]) {
  const formData = new FormData();
  formData.set("target", target);
  formData.set("textInput", textInput);
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/import/parse", {
    method: "POST",
    headers: getClientAuthHeaders(),
    body: formData
  });

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as ImportPreviewItem[];
}

export async function commitImportPreview(previewItems: ImportPreviewItem[]) {
  const response = await fetch("/api/import/commit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getClientAuthHeaders()
    },
    body: JSON.stringify({ previewItems })
  });

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as { importedCount: number };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // ignore
  }

  return "请求失败，请稍后再试。";
}
