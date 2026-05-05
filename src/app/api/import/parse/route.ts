import { NextResponse } from "next/server";
import { buildImportPreview } from "@/features/data-management/utils";
import type { ImportTarget } from "@/features/data-management/types";
import { requireAuthenticatedSupabaseRequest, SupabaseAuthError } from "@/lib/supabase/auth";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    await requireAuthenticatedSupabaseRequest(request);
    const formData = await request.formData();
    const target = String(formData.get("target") || "knowledge") as ImportTarget;
    const textInput = String(formData.get("textInput") || "");
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    const previewItems = await buildImportPreview(target, textInput, files);
    return NextResponse.json(previewItems);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "生成导入预览失败，请稍后再试。" }, { status: 500 });
  }
}
