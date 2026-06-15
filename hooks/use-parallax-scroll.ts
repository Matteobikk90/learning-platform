"use client";

import { SECTIONS } from "@/constants/parallax";
import type { SectionId } from "@/types/parallax";
import { useCallback, useEffect, useRef, useState } from "react";

export function useParallaxScroll(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [active, setActive] = useState<SectionId>("hero");
  const [visible, setVisible] = useState<Set<SectionId>>(new Set());
  const rafId = useRef<number | null>(null);
  const lastHash = useRef<SectionId>("hero");

  // Restore scroll position from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) as SectionId;
    if (!hash) return;
    const container = containerRef.current;
    const el = container?.querySelector<HTMLElement>(`#${hash}`);
    if (container && el) {
      container.scrollTop = el.offsetTop;
    }
  }, [containerRef]);

  // Track active section and sync URL hash only on section change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      const viewportCenter = containerRect.top + container.clientHeight / 2;

      let nextActive = SECTIONS[0].id as SectionId;
      let smallestDistance = Number.POSITIVE_INFINITY;

      for (const { id } of SECTIONS) {
        const el = container.querySelector<HTMLElement>(`#${id}`);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const isCenterInside =
          viewportCenter >= rect.top && viewportCenter < rect.bottom;

        if (isCenterInside) {
          nextActive = id as SectionId;
          break;
        }

        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          nextActive = id as SectionId;
        }
      }

      // Only call replaceState when the section actually changes —
      // calling it on every scroll frame triggers Chrome's navigation throttle.
      if (lastHash.current !== nextActive) {
        lastHash.current = nextActive;
        window.history.replaceState(null, "", `#${nextActive}`);
      }

      setActive((prev) => (prev === nextActive ? prev : nextActive));
      setVisible((prev) => {
        if (prev.has(nextActive)) return prev;
        const next = new Set(prev);
        next.add(nextActive);
        return next;
      });
    };

    const onScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        update();
        rafId.current = null;
      });
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
    };
  }, [containerRef]);

  const scrollTo = useCallback(
    (id: SectionId) => {
      const container = containerRef.current;
      const el = container?.querySelector<HTMLElement>(`#${id}`);
      if (!container || !el) return;
      container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    },
    [containerRef]
  );

  return { active, visible, scrollTo };
}
