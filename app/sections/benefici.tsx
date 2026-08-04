"use client";

import benefitsDesktop from "@/public/images/home/benefits-desktop.jpg";
import benefitsMobile from "@/public/images/home/benefits-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { useHorizontalProgress } from "@/hooks/use-horizontal-progress";
import { cn } from "@/lib/cn";
import type { BenefitContent, BeneficiSectionProps } from "@/types/parallax";
import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";

export function Benefici({
  visible,
  scrollContainerRef,
}: BeneficiSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations("Home.benefits");
  const benefits = t.raw("items") as BenefitContent[];
  const progress = useHorizontalProgress(sectionRef, scrollContainerRef);
  const totalSlides = benefits.length;

  const translateX = useMemo(
    () => progress * (totalSlides - 1) * 100,
    [progress, totalSlides]
  );
  const sceneTransform = `translate3d(-${translateX}vw, 0, 0)`;

  return (
    <section
      ref={sectionRef}
      id="benefici"
      className="parallax-section relative bg-navy"
      style={{
        height: `${totalSlides * 100}dvh`,
      }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="relative h-full will-change-transform"
            style={{
              width: `${totalSlides * 100}vw`,
              transform: sceneTransform,
              transition: "transform 0.05s linear",
            }}>
            <ResponsiveBackgroundImage
              desktopSrc={benefitsDesktop}
              mobileSrc={benefitsMobile}
              sizes={`${totalSlides * 100}vw`}
              className="absolute inset-0 size-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.68) 100%)",
            }}
          />
        </div>

        <div
          className="relative z-10 flex h-full will-change-transform"
          style={{
            width: `${totalSlides * 100}vw`,
            transform: sceneTransform,
            transition: "transform 0.05s linear",
          }}>
          {benefits.map(({ title, body }, index) => {
            const num = String(index + 1).padStart(2, "0");

            return (
            <article
              key={num}
              className="flex h-dvh w-screen shrink-0 flex-col items-center justify-center px-6 py-24 text-center">
              <div
                className={cn(
                  "parallax-content w-full max-w-3xl drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)]",
                  visible.has("benefici") && "visible"
                )}>
                <div className="mb-12 flex items-baseline justify-center gap-3">
                  <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                    {num}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/45">
                    / {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="section-title mb-8">{title}</h2>
                <div className="border-t border-white/25 pt-8">
                  <p className="label-upper w-full text-white/70 leading-6">
                    {body}
                  </p>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 text-white/55">
          <div className="h-px w-16 overflow-hidden bg-white/20">
            <div
              className="parallax-scroll-progress h-full bg-white"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase">
            {t("scroll")}
          </span>
        </div>
      </div>
    </section>
  );
}
