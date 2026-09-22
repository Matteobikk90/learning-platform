"use client";

import { useEffect, useRef } from "react";

import { getScrollProgress } from "@/functions/home/get-scroll-progress";

export function useBenefitsScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    let frame: number | null = null;

    const update = () => {
      const progress = getScrollProgress(
        viewport.getBoundingClientRect().top - section.getBoundingClientRect().top,
        section.offsetHeight - viewport.offsetHeight
      );

      section.style.setProperty("--benefit-progress", String(progress));
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        update();
        frame = null;
      });
    };

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(viewport);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { sectionRef, viewportRef };
}
