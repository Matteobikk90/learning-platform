"use client";

import { useMuxDurationSync } from "@/hooks/use-mux-duration-sync";
import type { MuxDurationSyncProps } from "@/types/video";

export function MuxDurationSync({ moduleIds }: MuxDurationSyncProps) {
  useMuxDurationSync(moduleIds);
  return null;
}
