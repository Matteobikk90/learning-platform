"use client";

import benefitsDesktop from "@/public/images/home/benefits-desktop.jpg";
import benefitsMobile from "@/public/images/home/benefits-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { useBenefitsScroll } from "@/hooks/use-benefits-scroll";
import type { BenefitContent } from "@/types/home";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";

export function Benefici() {
  const t = useTranslations("Home.benefits");
  const benefits = t.raw("items") as BenefitContent[];
  const totalSlides = benefits.length;
  const { sectionRef, viewportRef, trackRef, activeIndex, moveSlide } = useBenefitsScroll(totalSlides);

  return (
    <section
      ref={sectionRef}
      id="benefici"
      aria-label={t("label")}
      className="benefits-section bg-navy"
      style={{
        "--benefit-count": totalSlides,
      } as CSSProperties}>
      <div ref={viewportRef} className="benefits-viewport">
        <div className="benefits-panorama" aria-hidden="true">
          <ResponsiveBackgroundImage
            desktopSrc={benefitsDesktop}
            mobileSrc={benefitsMobile}
            sizes="(min-width: 768px) 300svh, 150svh"
            className="block size-full object-cover object-center"
          />
        </div>

        <div
          ref={trackRef}
          id="benefits-track"
          role="group"
          aria-label={t("label")}
          tabIndex={0}
          className="benefits-track">
          {benefits.map(({ title, body }, index) => {
            const num = String(index + 1).padStart(2, "0");

            return (
              <article
                key={num}
                className="benefits-panel">
                <div className="mx-auto w-full max-w-3xl">
                  <div className="mb-4 flex items-baseline gap-3 sm:mb-6">
                    <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                      {num}
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white">
                      / {String(totalSlides).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="section-title mb-4 sm:mb-6">{title}</h2>
                  <p className="border-t border-white/25 pt-4 font-mono text-xs leading-6 tracking-wide whitespace-pre-line text-white uppercase sm:pt-6 sm:tracking-widest">
                    {body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="benefits-controls">
        <button
          type="button"
          aria-label={t("previous")}
          aria-controls="benefits-track"
          disabled={activeIndex === 0}
          onClick={() => moveSlide(-1)}
          className="btn-secondary min-h-11 min-w-11 text-white disabled:cursor-default disabled:opacity-30">
          <span aria-hidden="true">←</span>
        </button>
        <span className="font-mono text-xs text-white" aria-live="polite" aria-atomic="true">
          {String(activeIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-label={t("next")}
          aria-controls="benefits-track"
          disabled={activeIndex === totalSlides - 1}
          onClick={() => moveSlide(1)}
          className="btn-secondary min-h-11 min-w-11 text-white disabled:cursor-default disabled:opacity-30">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
