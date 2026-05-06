import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type MuxWebhookEvent = {
  type: string;
  data: {
    id?: string;
    upload_id?: string;
    playback_ids?: {
      id: string;
      policy: string;
    }[];
  };
};

export async function POST(req: Request) {
  const event = (await req.json()) as MuxWebhookEvent;
  console.log("MUX EVENT", event.type);

  console.log("MUX DATA", event.data);

  if (event.type !== "video.asset.ready") {
    return NextResponse.json({ received: true });
  }

  const uploadId = event.data.upload_id;
  const assetId = event.data.id;
  const playbackId = event.data.playback_ids?.[0]?.id;

  if (!uploadId || !assetId || !playbackId) {
    return NextResponse.json(
      { error: "Missing mux asset data" },
      { status: 400 }
    );
  }

  await prisma.module.updateMany({
    where: { muxUploadId: uploadId },
    data: {
      muxAssetId: assetId,
      videoPlaybackId: playbackId,
    },
  });

  return NextResponse.json({ received: true });
}
