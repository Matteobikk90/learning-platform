"use client";

import { useEffect, useState, type RefObject } from "react";

export function useHorizontalProgress(
  sectionRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const sectionTop = sectionRect.top - containerRect.top;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = container.clientHeight;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        setProgress(0);
        return;
      }

      const scrolled = Math.min(Math.max(-sectionTop, 0), scrollableDistance);

      setProgress(scrolled / scrollableDistance);
    };

    const onScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    };

    update();

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [sectionRef, containerRef]);

  return progress;
}
