"use client";

import { Benefici } from "@/app/sections/benefici";
import { ChiSono } from "@/app/sections/chi-sono";
import { Corsi } from "@/app/sections/corsi";
import { Faq } from "@/app/sections/faq";
import { Hero } from "@/app/sections/hero";
import { BreathWind } from "@/components/parallax/breath-wind";
import { ParallaxNav } from "@/components/parallax/nav";
import { SECTIONS } from "@/constants/parallax";
import { useParallaxScroll } from "@/hooks/use-parallax-scroll";
import type { ParallaxProps } from "@/types/parallax";
import { useEffect, useMemo, useRef } from "react";

export function Parallax({ courses, footer, purchasedIds }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { active, visible, scrollTo } = useParallaxScroll(containerRef);
  const isDark = SECTIONS.find((s) => s.id === active)?.dark ?? true;
  const purchasedSet = useMemo(() => new Set(purchasedIds), [purchasedIds]);

  useEffect(() => {
    document.body.classList.add("parallax-active");
    return () => {
      document.body.classList.remove("parallax-active");
    };
  }, []);

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
        {footer}
        <BreathWind key={active} section={active} />
      </main>
    </>
  );
}
