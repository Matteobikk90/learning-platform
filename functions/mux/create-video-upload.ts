import { MUX_ERROR_MESSAGES } from "@/constants/mux";
import type { VideoUploadEndpointResponse } from "@/types/video";

export async function createVideoUpload(moduleId: string) {
  const response = await fetch("/api/mux/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId }),
  });
  const result = (await response.json()) as VideoUploadEndpointResponse;

  if (!response.ok || !result.uploadUrl) {
    throw new Error(result.error ?? MUX_ERROR_MESSAGES.createUploadFailed);
  }

  return result.uploadUrl;
}
