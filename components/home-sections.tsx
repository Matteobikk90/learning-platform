"use client";

import { useRef } from "react";

import { useSectionReveal } from "@/hooks/use-section-reveal";
import type { HomeSectionsProps } from "@/types/home";

export function HomeSections({ children }: HomeSectionsProps) {
  const ref = useRef<HTMLElement>(null);
  useSectionReveal(ref);

  return <main ref={ref} className="marketing-page">{children}</main>;
}
