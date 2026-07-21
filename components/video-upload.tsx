"use client";

import MuxUploader from "@mux/mux-uploader-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { VideoState } from "@/features/modules/video-state";

type VideoUploadProps = {
  moduleId: string;
  initialStatus: VideoState;
  initialError?: string | null;
};

type VideoStatusResponse = {
  status: VideoState;
  error: string | null;
};

export function VideoUpload({
  moduleId,
  initialStatus,
  initialError = null,
}: VideoUploadProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(initialStatus === "processing");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    if (!processing) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/admin/modules/${moduleId}/video-status`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Impossibile controllare lo stato del video.");
        }

        const result = (await response.json()) as VideoStatusResponse;

        if (cancelled) return;

        if (result.status === "ready") {
          setProcessing(false);
          setReady(true);
          router.refresh();
          return;
        }

        if (result.status === "error" || result.status === "empty") {
          setProcessing(false);
          setError(
            result.error ?? "Mux non è riuscito a elaborare il video."
          );
          router.refresh();
          return;
        }

        attempts += 1;
      } catch (pollError) {
        attempts += 1;

        if (attempts >= 6 && !cancelled) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Impossibile controllare lo stato del video."
          );
        }
      }

      if (!cancelled) {
        timer = setTimeout(poll, attempts < 20 ? 3_000 : 10_000);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [moduleId, processing, router]);

  async function getUploadUrl() {
    setError(null);
    setReady(false);

    const response = await fetch("/api/mux/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    });
    const result = (await response.json()) as {
      uploadUrl?: string;
      error?: string;
    };

    if (!response.ok || !result.uploadUrl) {
      throw new Error(result.error ?? "Impossibile avviare il caricamento.");
    }

    return result.uploadUrl;
  }

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
        onUploadError={() =>
          setError("Il caricamento si è interrotto. Riprova dal controllo qui sopra.")
        }
        onSuccess={() => setProcessing(true)}
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
