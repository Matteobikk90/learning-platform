import { MUX_ERROR_MESSAGES } from "@/constants/mux";
import type { MuxErrorMessageKey } from "@/types/mux";

export function getMuxErrorMessage(
  translate: (key: MuxErrorMessageKey) => string,
  error: unknown,
  fallbackKey: MuxErrorMessageKey
) {
  const message = error instanceof Error ? error.message : error;
  const key = Object.values(MUX_ERROR_MESSAGES).find(
    (candidate) => candidate === message
  );

  return key ? translate(key) : translate(fallbackKey);
}
