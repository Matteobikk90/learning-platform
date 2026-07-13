"use client";

import { BENEFITS } from "@/constants/parallax";
import { useHorizontalProgress } from "@/hooks/use-horizontal-progress";
import { cn } from "@/lib/cn";
import type { BeneficiSectionProps } from "@/types/parallax";
import { useMemo, useRef } from "react";

export function Benefici({
  visible,
  scrollContainerRef,
}: BeneficiSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useHorizontalProgress(sectionRef, scrollContainerRef);
  const totalSlides = BENEFITS.length;

  const translateX = useMemo(
    () => progress * (totalSlides - 1) * 100,
    [progress, totalSlides]
  );

  return (
    <section
      ref={sectionRef}
      id="benefici"
      className="parallax-section relative bg-canvas"
      style={{
        height: `${totalSlides * 100}dvh`,
      }}>
      {/* Sticky viewport — stays fixed while user scrolls through the section */}
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* Sliding container — all slides in a row, translated by progress */}
        <div
          className="flex h-full will-change-transform"
          style={{
            width: `${totalSlides * 100}vw`,
            transform: `translate3d(-${translateX}vw, 0, 0)`,
            transition: "transform 0.05s linear",
          }}>
          {BENEFITS.map(({ num, title, body }) => (
            <article
              key={num}
              className="shrink-0 w-screen h-dvh flex flex-col items-center justify-center px-6 py-24">
              <div
                className={cn(
                  "parallax-content max-w-xl w-full",
                  visible.has("benefici") && "visible"
                )}>
                <div className="flex items-baseline gap-3 mb-12">
                  <span className="font-mono text-[0.7rem] font-bold tracking-[0.2em] uppercase text-petrol">
                    {num}
                  </span>
                  <span className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-muted opacity-40">
                    / {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="section-title mb-8">{title}</h2>
                <div className="border-t-2 border-stroke pt-8">
                  <p className="label-upper text-muted leading-5 w-full">
                    {body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-muted opacity-45">
          <div className="h-px w-16 overflow-hidden bg-muted/15">
            <div
              className="h-full parallax-scroll-progress bg-petrol"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase">
            Scorri
          </span>
        </div>
      </div>
    </section>
  );
}
