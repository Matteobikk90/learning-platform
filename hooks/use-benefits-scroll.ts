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

    const header = document.querySelector<HTMLElement>(".site-header");
    let frame: number | null = null;

    const update = () => {
      const progress = getScrollProgress(
        -section.getBoundingClientRect().top,
        section.offsetHeight - viewport.offsetHeight
      );

      section.style.setProperty("--benefit-progress", String(progress));
    };

    const measure = () => {
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      section.style.setProperty("--benefit-header-height", `${headerHeight}px`);
      update();
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        update();
        frame = null;
      });
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    if (header) resizeObserver.observe(header);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { sectionRef, viewportRef };
}
