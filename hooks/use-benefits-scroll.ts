"use client";

import { useEffect, useRef, useState } from "react";

import { REDUCED_MOTION_QUERY } from "@/constants/home";
import { getScrollProgress } from "@/functions/home/get-scroll-progress";

export function useBenefitsScroll(slideCount: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const header = document.querySelector<HTMLElement>(".site-header");
    let scrollDriven = false;
    let stickyTop = 0;
    let frame: number | null = null;

    const update = () => {
      const progress = scrollDriven
        ? getScrollProgress(
            stickyTop - section.getBoundingClientRect().top,
            section.offsetHeight - viewport.offsetHeight
          )
        : getScrollProgress(track.scrollLeft, track.scrollWidth - track.clientWidth);

      section.style.setProperty("--benefit-progress", String(media.matches ? 0 : progress));
      setActiveIndex(Math.round(progress * Math.max(0, slideCount - 1)));
    };

    const measure = () => {
      stickyTop = header?.getBoundingClientRect().height ?? 0;
      const panelHeight = Math.max(0, ...Array.from(track.children, (panel) => panel.getBoundingClientRect().height));
      const nextScrollDriven = !media.matches && slideCount > 1
        && panelHeight <= window.innerHeight - stickyTop + 1;

      section.style.setProperty("--benefit-sticky-top", `${stickyTop}px`);
      section.style.setProperty("--benefit-panel-height", `${panelHeight}px`);
      section.style.setProperty("--benefit-viewport-width", `${track.clientWidth}px`);
      section.dataset.scrollDriven = String(nextScrollDriven);
      track.tabIndex = nextScrollDriven ? -1 : 0;

      if (scrollDriven !== nextScrollDriven) track.scrollLeft = 0;
      scrollDriven = nextScrollDriven;
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
    track.addEventListener("scroll", onScroll, { passive: true });
    media.addEventListener("change", measure);
    measure();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      track.removeEventListener("scroll", onScroll);
      media.removeEventListener("change", measure);
      if (frame !== null) window.cancelAnimationFrame(frame);
      delete section.dataset.scrollDriven;
    };
  }, [slideCount]);

  function moveSlide(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    const index = Math.round(track.scrollLeft / track.clientWidth);
    const nextIndex = Math.min(slideCount - 1, Math.max(0, index + direction));
    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: window.matchMedia(REDUCED_MOTION_QUERY).matches ? "instant" : "smooth",
    });
  }

  return { sectionRef, viewportRef, trackRef, activeIndex, moveSlide };
}
