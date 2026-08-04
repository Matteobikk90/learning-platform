"use client";

import MuxUploader from "@mux/mux-uploader-react";

import { useVideoUpload } from "@/hooks/use-video-upload";
import type { VideoUploadProps } from "@/types/video";

export function VideoUpload({
  moduleId,
  initialStatus,
  initialError = null,
}: VideoUploadProps) {
  const {
    error,
    getUploadUrl,
    handleUploadError,
    handleUploadSuccess,
    processing,
    ready,
  } = useVideoUpload({ moduleId, initialStatus, initialError });

  if (processing) {
    return (
      <div
        className="mt-3 rounded-md border border-stroke bg-surface px-5 py-4"
        role="status">
        <p className="text-sm text-petrol animate-pulse">
          Upload completato. Mux sta preparando lo streaming…
        </p>
        <p className="mt-1 text-xs text-subtle">
          La pagina si aggiornerà automaticamente appena il video sarà pronto.
        </p>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    );
  }

  if (ready) {
    return (
      <p
        className="mt-3 rounded-md border border-stroke bg-surface px-5 py-3 text-sm text-petrol"
        role="status">
        Video pronto per lo streaming.
      </p>
    );
  }

  return (
    <div>
      <MuxUploader
        endpoint={getUploadUrl}
        pausable
        dynamicChunkSize
        onUploadError={handleUploadError}
        onSuccess={handleUploadSuccess}
        className="mt-3 inline-flex w-full min-h-[160px] rounded-lg border-2 border-dashed border-stroke bg-surface font-sans text-ink [[upload-in-progress]]:border-solid [[upload-in-progress]]:border-ocean [[upload-complete]]:border-petrol"
        style={
          {
            "--progress-bar-fill-color": "var(--color-ocean)",
            "--overlay-background-color":
              "color-mix(in oklab, var(--color-canvas) 95%, transparent)",
          } as React.CSSProperties
        }>
        <button slot="file-select" type="button" className="btn-primary">
          Seleziona video
        </button>
      </MuxUploader>

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
