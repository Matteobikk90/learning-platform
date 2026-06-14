"use client";

import { Benefici } from "@/app/sections/benefici";
import { ChiSono } from "@/app/sections/chi-sono";
import { Corsi } from "@/app/sections/corsi";
import { Faq } from "@/app/sections/faq";
import { Hero } from "@/app/sections/hero";
import { ParallaxNav } from "@/components/parallax/nav";
import { SECTIONS } from "@/constants/parallax";
import type { ParallaxProps, SectionId } from "@/types/parallax";
import { useEffect, useMemo, useRef, useState } from "react";

export function Parallax({ courses, purchasedIds }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SectionId>("hero");
  const [visible, setVisible] = useState<Set<SectionId>>(new Set());
  const isDark = SECTIONS.find((s) => s.id === active)?.dark ?? true;
  const purchasedSet = useMemo(() => new Set(purchasedIds), [purchasedIds]);

  // Hide default navbar and lock body scroll
  useEffect(() => {
    document.body.classList.add("parallax-active");
    return () => {
      document.body.classList.remove("parallax-active");
    };
  }, []);

  // Scroll to hash on initial load
  useEffect(() => {
    const hash = window.location.hash.slice(1) as SectionId;
    if (hash && containerRef.current) {
      containerRef.current
        .querySelector<HTMLElement>(`#${hash}`)
        ?.scrollIntoView();
    }
  }, []);

  // Track active section via scroll position, update URL hash.
  // Strategy: active = last section whose offsetTop ≤ current scrollTop.
  // This correctly handles sections of any height (including the 300dvh Benefici).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      const viewportCenter = containerRect.top + container.clientHeight / 2;

      let nextActive = SECTIONS[0].id as SectionId;
      let smallestDistance = Number.POSITIVE_INFINITY;

      SECTIONS.forEach(({ id }) => {
        const el = container.querySelector<HTMLElement>(`#${id}`);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        const sectionStart = rect.top;
        const sectionEnd = rect.bottom;

        const isCenterInsideSection =
          viewportCenter >= sectionStart && viewportCenter < sectionEnd;

        if (isCenterInsideSection) {
          nextActive = id as SectionId;
          smallestDistance = 0;
          return;
        }

        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          nextActive = id as SectionId;
        }
      });

      window.history.replaceState(null, "", `#${nextActive}`);
      setActive((prev) => (prev === nextActive ? prev : nextActive));

      setVisible((prev) => {
        if (prev.has(nextActive)) return prev;

        const next = new Set(prev);
        next.add(nextActive);
        return next;
      });
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
  }, []);

  const scrollTo = (id: SectionId) => {
    containerRef.current

      ?.querySelector<HTMLElement>(`#${id}`)

      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <ParallaxNav active={active} isDark={isDark} scrollTo={scrollTo} />

      <main
        ref={containerRef}
        className="fixed inset-0 overflow-y-scroll parallax-scroll">
        <Hero visible={visible} scrollTo={scrollTo} />
        <Benefici visible={visible} scrollContainerRef={containerRef} />
        <Corsi
          visible={visible}
          courses={courses}
          purchasedSet={purchasedSet}
        />
        <ChiSono visible={visible} />
        <Faq visible={visible} />
      </main>
    </>
  );
}
