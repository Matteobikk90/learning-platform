"use client";

import { useEffect, useState, type RefObject } from "react";
import { BENEFITS_SCROLL_QUERY } from "@/constants/home";

export function useHorizontalProgress(
  sectionRef: RefObject<HTMLElement | null>
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const media = window.matchMedia(BENEFITS_SCROLL_QUERY);
    let rafId: number | null = null;

    const update = () => {
      if (!media.matches) {
        setProgress(0);
        return;
      }

      const section = sectionRef.current;
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        setProgress(0);
        return;
      }

      const scrolled = Math.min(Math.max(-sectionTop, 0), scrollableDistance);

      setProgress(scrolled / scrollableDistance);
    };

    const onScroll = () => {
      if (!media.matches || rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    media.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      media.removeEventListener("change", update);

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [sectionRef]);

  return progress;
}
