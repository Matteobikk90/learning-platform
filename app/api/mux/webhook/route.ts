import { NextResponse } from "next/server";

import { MUX_ERROR_MESSAGES } from "@/constants/mux";
import { applyMuxProcessingTransition } from "@/functions/mux/apply-processing-transition";
import {
  markMuxAssetReady,
  markMuxUploadFailed,
} from "@/functions/mux/process-upload";
import { requireEnv } from "@/lib/env";
import { getMux } from "@/lib/mux";
import type { MuxWebhookEvent } from "@/types/mux";

export async function POST(request: Request) {
  if (!request.headers.get("mux-signature")) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const mux = getMux();

  let event: MuxWebhookEvent;

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
          MUX_ERROR_MESSAGES.missingPlaybackId,
          event.data.id
        );

    if (!applyMuxProcessingTransition(transition)) {
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

      applyMuxProcessingTransition(
        await markMuxUploadFailed(
          uploadId,
          errorMessage ?? MUX_ERROR_MESSAGES.processingFailed,
          event.type === "video.asset.errored" ? event.data.id : undefined
        )
      );
    }
  }

  return NextResponse.json({ received: true });
}
