"use client";

import MuxUploader from "@mux/mux-uploader-react";
import { useState } from "react";

import { attachMuxUploadToModule } from "@/features/modules/actions";

type VideoUploadProps = {
  moduleId: string;
};

export function VideoUpload({ moduleId }: VideoUploadProps) {
  const [done, setDone] = useState(false);

  async function getUploadUrl() {
    const res = await fetch("/api/mux/upload", { method: "POST" });
    if (!res.ok) throw new Error("Failed to create upload URL");
    const { uploadUrl, uploadId } = await res.json();
    await attachMuxUploadToModule(moduleId, uploadId);
    return uploadUrl as string;
  }

  if (done) {
    return (
      <p className="mt-3 rounded-md border border-stroke bg-surface px-5 py-3 text-sm text-petrol">
        Upload completato — il video sarà disponibile tra qualche secondo.
      </p>
    );
  }

  return (
    <MuxUploader
      endpoint={getUploadUrl}
      onSuccess={() => setDone(true)}
      className="mt-3 inline-flex w-full rounded-lg border-2 border-dashed border-stroke bg-surface font-sans text-ink [[upload-in-progress]]:border-solid [[upload-in-progress]]:border-ocean [[upload-complete]]:border-petrol"
      style={
        {
          minHeight: 160,
          "--progress-bar-fill-color": "#1A5F9C",
          "--overlay-background-color": "rgba(235, 241, 240, 0.95)",
        } as React.CSSProperties
      }
    >
      <button slot="file-select" type="button" className="btn-primary">
        Seleziona video
      </button>
    </MuxUploader>
  );
}
