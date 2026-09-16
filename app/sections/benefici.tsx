"use client";

import benefitsDesktop from "@/public/images/home/benefits-desktop.jpg";
import benefitsMobile from "@/public/images/home/benefits-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { useHorizontalProgress } from "@/hooks/use-horizontal-progress";
import type { BenefitContent } from "@/types/home";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";

export function Benefici() {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations("Home.benefits");
  const benefits = t.raw("items") as BenefitContent[];
  const progress = useHorizontalProgress(sectionRef);
  const totalSlides = benefits.length;

  return (
    <section
      ref={sectionRef}
      id="benefici"
      className="benefits-section bg-navy"
      style={{
        "--benefit-count": totalSlides,
        "--benefit-progress": progress,
      } as CSSProperties}>
      <div className="benefits-viewport">
        <div className="benefits-panorama" aria-hidden="true">
          <ResponsiveBackgroundImage
            desktopSrc={benefitsDesktop}
            mobileSrc={benefitsMobile}
            sizes="(min-width: 768px) and (min-height: 700px) and (prefers-reduced-motion: no-preference) 300vh, 100vw"
            className="block size-full object-cover object-center"
          />
        </div>

        <div className="benefits-track">
          {benefits.map(({ title, body }, index) => {
            const num = String(index + 1).padStart(2, "0");

            return (
              <article
                key={num}
                className="home-section">
                <div className="mx-auto w-full max-w-3xl">
                  <div className="mb-8 flex items-baseline gap-3">
                    <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                      {num}
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white">
                      / {String(totalSlides).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="section-title mb-8">{title}</h2>
                  <p className="border-t border-white/25 pt-8 font-mono text-xs leading-6 tracking-widest whitespace-pre-line text-white uppercase">
                    {body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
