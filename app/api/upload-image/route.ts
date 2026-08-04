import { randomUUID } from "node:crypto";
import sharp from "sharp";

import { COURSE_IMAGE_ERRORS } from "@/constants/courses";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getApiAdmin } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 512 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const ALLOWED_MIME_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.invalidSize },
      { status: 413 }
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.invalidRequest },
      { status: 400 }
    );
  }
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.noFileSelected },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.invalidType },
      { status: 400 }
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.invalidSize },
      { status: 400 }
    );
  }

  let optimizedImage: Buffer;

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_IMAGE_PIXELS,
    });
    const metadata = await image.metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < 320 ||
      metadata.height < 180 ||
      metadata.width > 8_000 ||
      metadata.height > 8_000
    ) {
      return NextResponse.json(
        { error: COURSE_IMAGE_ERRORS.invalidDimensions },
        { status: 400 }
      );
    }

    optimizedImage = await image
      .rotate()
      .resize({
        width: 2_560,
        height: 2_560,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch (error) {
    console.warn("[course-images] Invalid image rejected", {
      type: file.type,
      size: file.size,
      error: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.invalidFile },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.webp`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from("course-images")
    .upload(filename, optimizedImage, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    console.error("[course-images] Upload failed", {
      filename,
      message: error.message,
    });
    return NextResponse.json(
      { error: COURSE_IMAGE_ERRORS.uploadFailed },
      { status: 500 }
    );
  }

  const { data } = supabase.storage
    .from("course-images")
    .getPublicUrl(filename);

  return NextResponse.json(
    { url: data.publicUrl },
    { headers: { "Cache-Control": "no-store" } }
  );
}
