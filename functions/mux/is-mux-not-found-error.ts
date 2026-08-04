import type { MuxApiError } from "@/types/mux";

export function isMuxNotFoundError(error: unknown) {
  return (error as MuxApiError).status === 404;
}
