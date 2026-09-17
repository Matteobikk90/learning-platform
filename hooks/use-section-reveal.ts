"use client";

import { useEffect, type RefObject } from "react";

import {
  REDUCED_MOTION_QUERY,
  SECTION_REVEAL_KEYFRAMES,
  SECTION_REVEAL_OPTIONS,
} from "@/constants/home";

export function useSectionReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;

    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const revealed = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || media.matches) continue;
        const element = entry.target;
        observer.unobserve(element);
        revealed.add(element);
        const animation = element.animate(SECTION_REVEAL_KEYFRAMES, SECTION_REVEAL_OPTIONS);
        animations.add(animation);
        animation.addEventListener("finish", () => animations.delete(animation), { once: true });
      }
    }, { threshold: 0.08 });

    const syncPreference = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      if (media.matches) return;

      root.querySelectorAll("[data-reveal]").forEach((element) => {
        if (!revealed.has(element)) observer.observe(element);
      });
    };

    syncPreference();
    media.addEventListener("change", syncPreference);

    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      media.removeEventListener("change", syncPreference);
    };
  }, [rootRef]);
}
