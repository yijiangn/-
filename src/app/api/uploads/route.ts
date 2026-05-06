import { NextResponse } from "next/server";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";
import { uploadRecordFileService } from "@/lib/supabase/study-records-repository";

const uploadKinds = ["screenshot", "photo", "file"] as const;
const uploadTones = ["emerald", "sky", "amber", "rose", "slate"] as const;

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const recordId = formData.get("recordId");
    const kind = formData.get("kind");
    const tone = formData.get("tone");

    if (!(file instanceof File) || typeof recordId !== "string" || recordId.trim().length === 0) {
      return NextResponse.json({ message: "缺少文件或记录 ID。" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ message: "上传文件不能为空。" }, { status: 400 });
    }

    if (kind && !uploadKinds.includes(kind as (typeof uploadKinds)[number])) {
      return NextResponse.json({ message: "附件类型无效。" }, { status: 400 });
    }

    if (tone && !uploadTones.includes(tone as (typeof uploadTones)[number])) {
      return NextResponse.json({ message: "附件配色无效。" }, { status: 400 });
    }

    const uploaded = await uploadRecordFileService({
      recordId: recordId.trim(),
      label: String(formData.get("label") || file.name).trim() || file.name,
      kind: (kind as "screenshot" | "photo" | "file") || "photo",
      tone: (tone as "emerald" | "sky" | "amber" | "rose" | "slate") || "slate",
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileBody: await file.arrayBuffer()
    });

    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "上传附件失败，请稍后再试。" }, { status: 500 });
  }
}
