import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Storage not configured";
    console.error("[upload-image]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { error } = await supabase.storage
    .from("course-images")
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[upload-image] Supabase storage error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("course-images").getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}
