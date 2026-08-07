"use client";

import {
  BREATH_WIND_DURATION_MS,
  BREATH_WIND_SCROLL_THRESHOLD_PX,
} from "@/constants/breath-wind";
import {
  createBreathGust,
  getBreathWindCooldown,
} from "@/functions/breath-wind/create-breath-gust";
import type { BreathGust } from "@/types/breath-wind";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

export function useBreathWind(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const [gust, setGust] = useState<BreathGust | null>(null);
  const gustId = useRef(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let animationFrame: number | null = null;
    let clearTimer: number | null = null;
    let distance = 0;
    let lastScrollTop = container.scrollTop;
    let nextAllowedAt = 0;

    const update = () => {
      const scrollTop = container.scrollTop;
      distance += Math.abs(scrollTop - lastScrollTop);
      lastScrollTop = scrollTop;
      const now = performance.now();

      if (
        distance >= BREATH_WIND_SCROLL_THRESHOLD_PX &&
        now >= nextAllowedAt
      ) {
        const id = ++gustId.current;
        setGust(createBreathGust(id));
        distance = 0;
        nextAllowedAt = now + getBreathWindCooldown();

        if (clearTimer !== null) window.clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => {
          setGust((current) => (current?.id === id ? null : current));
        }, BREATH_WIND_DURATION_MS);
      }

      animationFrame = null;
    };

    const onScroll = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (clearTimer !== null) window.clearTimeout(clearTimer);
    };
  }, [containerRef]);

  return gust;
}
