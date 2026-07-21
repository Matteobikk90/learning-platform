import { getAppUrl, requireEnv } from "@/lib/env";
import { getMux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { getApiAdmin } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  moduleId: z.string().min(1),
});

export async function POST(request: Request) {
  const admin = await getApiAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }

  const courseModule = await prisma.module.findUnique({
    where: { id: parsed.data.moduleId },
    select: {
      id: true,
      title: true,
      muxUploadId: true,
    },
  });

  if (!courseModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  try {
    requireEnv("MUX_WEBHOOK_SECRET");
  } catch {
    return NextResponse.json(
      { error: "Configura il segreto webhook Mux prima di caricare video" },
      { status: 503 }
    );
  }

  const mux = getMux();
  let expectedUploadId = courseModule.muxUploadId;

  if (courseModule.muxUploadId) {
    try {
      const pendingUpload = await mux.video.uploads.retrieve(
        courseModule.muxUploadId
      );

      if (pendingUpload.status === "waiting" && pendingUpload.url) {
        return NextResponse.json({ uploadUrl: pendingUpload.url });
      }

      if (pendingUpload.status === "asset_created") {
        return NextResponse.json(
          { error: "Il video è già in elaborazione" },
          { status: 409 }
        );
      }

      await prisma.module.update({
        where: { id: courseModule.id },
        data: { muxUploadId: null },
      });
      expectedUploadId = null;
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        await prisma.module.update({
          where: { id: courseModule.id },
          data: { muxUploadId: null },
        });
        expectedUploadId = null;
      } else {
        console.error("[mux] Failed to inspect pending upload", {
          uploadId: courseModule.muxUploadId,
          error,
        });
        return NextResponse.json(
          { error: "Impossibile recuperare il caricamento precedente" },
          { status: 503 }
        );
      }
    }
  }

  let uploadId: string | null = null;

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: new URL(getAppUrl()).origin,
      timeout: 60 * 60,
      new_asset_settings: {
        playback_policies: ["public"],
        passthrough: courseModule.id,
        meta: {
          creator_id: admin.id,
          external_id: courseModule.id,
          title: courseModule.title,
        },
      },
    });

    if (!upload.url) {
      throw new Error("Mux did not return an upload URL");
    }

    uploadId = upload.id;

    const attached = await prisma.module.updateMany({
      where: {
        id: courseModule.id,
        muxUploadId: expectedUploadId,
      },
      data: {
        muxUploadId: upload.id,
        videoError: null,
      },
    });

    if (attached.count === 0) {
      await mux.video.uploads.cancel(upload.id).catch(() => undefined);
      uploadId = null;

      return NextResponse.json(
        { error: "Un altro caricamento è già stato avviato" },
        { status: 409 }
      );
    }

    return NextResponse.json({ uploadUrl: upload.url });
  } catch (error) {
    if (uploadId) {
      await mux.video.uploads.cancel(uploadId).catch(() => undefined);
    }

    console.error("[mux] Failed to create direct upload", error);
    return NextResponse.json(
      { error: "Impossibile avviare il caricamento del video" },
      { status: 500 }
    );
  }
}
