import { randomUUID } from "node:crypto";

import { getSupabaseAdmin } from "@/lib/supabase";
import { getApiAdmin } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nessun file selezionato" }, { status: 400 });
  }

  const extension = EXTENSIONS_BY_MIME_TYPE[file.type];

  if (!extension) {
    return NextResponse.json(
      { error: "Sono supportati soltanto JPG, PNG, WebP e AVIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "L’immagine deve pesare meno di 5 MB" },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${extension}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from("course-images")
    .upload(filename, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[course-images] Upload failed", {
      filename,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Impossibile caricare l’immagine" },
      { status: 500 }
    );
  }

  const { data } = supabase.storage
    .from("course-images")
    .getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}
