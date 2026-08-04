import { revalidatePath } from "next/cache";
import { after, NextResponse } from "next/server";

import {
  markMuxAssetReady,
  markMuxUploadFailed,
  type MuxProcessingTransition,
} from "@/features/modules/mux-processing";
import { requireEnv } from "@/lib/env";
import { deleteMuxAsset, getMux } from "@/lib/mux";

function revalidateModule(courseId: string, moduleId: string) {
  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/profile/courses/${courseId}`);
  revalidatePath(`/profile/courses/${courseId}/modules/${moduleId}`);
}

function applyTransition(transition: MuxProcessingTransition | null) {
  if (!transition) return false;

  revalidateModule(transition.courseId, transition.moduleId);

  if (transition.assetIdsToDelete.length > 0) {
    after(() => Promise.all(transition.assetIdsToDelete.map(deleteMuxAsset)));
  }

  return true;
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
    const playback = event.data.playback_ids?.find(
      ({ policy }) => policy === "public" || policy === "signed"
    );

    if (!uploadId) {
      return NextResponse.json({ received: true });
    }

    const transition = playback
      ? await markMuxAssetReady({
          uploadId,
          assetId: event.data.id,
          playbackId: playback.id,
          playbackPolicy:
            playback.policy === "signed" ? "signed" : "public",
          durationSeconds: event.data.duration,
        })
      : await markMuxUploadFailed(
          uploadId,
          "Mux non ha generato un identificativo di riproduzione.",
          event.data.id
        );

    if (!applyTransition(transition)) {
      console.warn("[mux] Ready asset has no pending module", {
        assetId: event.data.id,
        uploadId,
      });
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
      const errorMessage =
        event.type === "video.asset.errored"
          ? event.data.errors?.messages?.join(" ")
          : "Il caricamento non è stato completato.";

      applyTransition(
        await markMuxUploadFailed(
          uploadId,
          errorMessage ?? "Mux non è riuscito a elaborare il video.",
          event.type === "video.asset.errored" ? event.data.id : undefined
        )
      );
    }
  }

  return NextResponse.json({ received: true });
}
