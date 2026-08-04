import { MUX_ERROR_MESSAGES } from "@/constants/mux";
import type { VideoStatusResponse } from "@/types/video";

export async function getVideoStatus(moduleId: string) {
  const response = await fetch(
    `/api/admin/modules/${moduleId}/video-status`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(MUX_ERROR_MESSAGES.unavailableStatus);
  }

  return (await response.json()) as VideoStatusResponse;
}
