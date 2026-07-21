import { revalidatePath } from "next/cache";
import { after, NextResponse } from "next/server";

import { requireEnv } from "@/lib/env";
import { deleteMuxAsset, getMux } from "@/lib/mux";
import { prisma } from "@/lib/prisma";

function revalidateModule(courseId: string, moduleId: string) {
  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/profile/courses/${courseId}`);
  revalidatePath(`/profile/courses/${courseId}/modules/${moduleId}`);
}

export async function POST(request: Request) {
  if (!request.headers.get("mux-signature")) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const mux = getMux();

  let event: Awaited<ReturnType<typeof mux.webhooks.unwrap>>;

  try {
    event = await mux.webhooks.unwrap(
      body,
      request.headers,
      requireEnv("MUX_WEBHOOK_SECRET")
    );
  } catch (error) {
    console.error("[mux] Invalid webhook signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "video.asset.ready") {
    const uploadId = event.data.upload_id;
    const playbackId = event.data.playback_ids?.[0]?.id;

    if (!uploadId) {
      return NextResponse.json({ received: true });
    }

    if (!playbackId) {
      const courseModule = await prisma.module.findUnique({
        where: { muxUploadId: uploadId },
        select: { id: true, courseId: true },
      });

      if (courseModule) {
        await prisma.module.update({
          where: { id: courseModule.id },
          data: {
            muxUploadId: null,
            videoError: "Mux non ha generato un identificativo di riproduzione.",
          },
        });
        revalidateModule(courseModule.courseId, courseModule.id);
      }

      return NextResponse.json({ received: true });
    }

    const courseModule = await prisma.module.findUnique({
      where: { muxUploadId: uploadId },
      select: { id: true, courseId: true, muxAssetId: true },
    });

    if (!courseModule) {
      console.warn("[mux] Ready asset has no pending module", {
        assetId: event.data.id,
        uploadId,
      });
      return NextResponse.json({ received: true });
    }

    const duration = event.data.duration;

    await prisma.module.update({
      where: { id: courseModule.id },
      data: {
        muxUploadId: null,
        muxAssetId: event.data.id,
        videoPlaybackId: playbackId,
        videoError: null,
        ...(typeof duration === "number" && duration > 0
          ? { durationSeconds: Math.ceil(duration) }
          : {}),
      },
    });

    revalidateModule(courseModule.courseId, courseModule.id);

    if (courseModule.muxAssetId !== event.data.id) {
      after(() => deleteMuxAsset(courseModule.muxAssetId));
    }
  }

  if (
    event.type === "video.asset.errored" ||
    event.type === "video.upload.errored" ||
    event.type === "video.upload.cancelled"
  ) {
    const uploadId =
      event.type === "video.asset.errored"
        ? event.data.upload_id
        : event.data.id;

    if (uploadId) {
      const courseModule = await prisma.module.findUnique({
        where: { muxUploadId: uploadId },
        select: { id: true, courseId: true },
      });

      if (courseModule) {
        const errorMessage =
          event.type === "video.asset.errored"
            ? event.data.errors?.messages?.join(" ")
            : "Il caricamento non è stato completato.";

        await prisma.module.update({
          where: { id: courseModule.id },
          data: {
            muxUploadId: null,
            videoError:
              errorMessage?.slice(0, 500) ??
              "Mux non è riuscito a elaborare il video.",
          },
        });

        revalidateModule(courseModule.courseId, courseModule.id);
      }
    }

    if (event.type === "video.asset.errored") {
      after(() => deleteMuxAsset(event.data.id));
    }
  }

  return NextResponse.json({ received: true });
}
