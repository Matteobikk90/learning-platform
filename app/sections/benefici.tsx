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
                  <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-petrol">
                    {num}
                  </span>
                  <span
                    className="text-[0.65rem] tracking-[0.15em] uppercase"
                    style={{ color: "var(--color-muted)", opacity: 0.4 }}>
                    / {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="section-title mb-8">{title}</h2>
                <div className="border-t-2 border-stroke pt-8">
                  <p className="text-sm text-muted leading-[1.9] max-w-[55ch]">
                    {body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Progress indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3"
          style={{ color: "var(--color-muted)", opacity: 0.45 }}>
          <div
            className="h-px w-16 overflow-hidden"
            style={{ background: "rgba(61,100,98,0.15)" }}>
            <div
              className="h-full parallax-scroll-progress"
              style={{
                width: `${progress * 100}%`,
                background: "var(--color-petrol)",
              }}
            />
          </div>
          <span className="text-[0.625rem] tracking-[0.25em] uppercase">
            Scorri
          </span>
        </div>
      </div>
    </section>
  );
}
