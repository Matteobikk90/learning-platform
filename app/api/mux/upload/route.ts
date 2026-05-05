import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: "Missing Mux environment variables" },
        { status: 500 }
      );
    }

    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    });

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
      },
      cors_origin: "*",
    });

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error("MUX_UPLOAD_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create Mux upload URL" },
      { status: 500 }
    );
  }
}
