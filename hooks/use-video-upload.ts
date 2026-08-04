"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { MUX_ERROR_MESSAGES, MUX_STATUS_POLLING } from "@/constants/mux";
import { createVideoUpload } from "@/functions/mux/create-video-upload";
import { getMuxErrorMessage } from "@/functions/mux/get-mux-error-message";
import { getVideoStatus } from "@/functions/mux/get-video-status";
import type { UseVideoUploadOptions } from "@/types/video";

export function useVideoUpload({
  moduleId,
  initialStatus,
  initialError = null,
}: UseVideoUploadOptions) {
  const t = useTranslations("Video");
  const tMuxError = useTranslations("MuxErrors");
  const router = useRouter();
  const [processing, setProcessing] = useState(initialStatus === "processing");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    initialError
      ? getMuxErrorMessage(
          tMuxError,
          initialError,
          MUX_ERROR_MESSAGES.processingFailed
        )
      : null
  );

  useEffect(() => {
    if (!processing) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async () => {
      try {
        const result = await getVideoStatus(moduleId);

        if (cancelled) return;

        consecutiveErrors = 0;

        if (result.status === "ready") {
          setProcessing(false);
          setReady(true);
          router.refresh();
          return;
        }

        if (result.status === "error" || result.status === "empty") {
          setProcessing(false);
          setError(
            getMuxErrorMessage(
              tMuxError,
              result.error,
              MUX_ERROR_MESSAGES.processingFailed
            )
          );
          router.refresh();
          return;
        }

        attempts += 1;
      } catch (pollError) {
        consecutiveErrors += 1;

        if (consecutiveErrors >= MUX_STATUS_POLLING.maxErrors && !cancelled) {
          setError(
            getMuxErrorMessage(
              tMuxError,
              pollError,
              MUX_ERROR_MESSAGES.unavailableStatus
            )
          );
        }
      }

      if (!cancelled) {
        timer = setTimeout(
          poll,
          attempts < MUX_STATUS_POLLING.fastAttempts
            ? MUX_STATUS_POLLING.fastIntervalMs
            : MUX_STATUS_POLLING.slowIntervalMs
        );
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [moduleId, processing, router, tMuxError]);

  async function getUploadUrl() {
    setError(null);
    setReady(false);
    return createVideoUpload(moduleId);
  }

  return {
    error,
    getUploadUrl,
    processing,
    ready,
    handleUploadSuccess: () => setProcessing(true),
    handleUploadError: () => setError(t("uploadInterrupted")),
  };
}
