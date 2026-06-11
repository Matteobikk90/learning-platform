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

  // Track active section via IntersectionObserver, update URL hash
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id as SectionId;
            setActive(id);
            setVisible((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
            window.history.replaceState(null, "", `#${id}`);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = container.querySelector(`#${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
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
        <Benefici visible={visible} />
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
