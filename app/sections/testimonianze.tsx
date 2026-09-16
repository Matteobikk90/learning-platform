import { useTranslations } from "next-intl";

import { TESTIMONIAL_REELS } from "@/constants/testimonials";
import { cn } from "@/lib/cn";
import type { BaseSectionProps } from "@/types/parallax";

export function Testimonianze({ visible }: BaseSectionProps) {
  const t = useTranslations("Home.testimonials");

  return (
    <section
      id="testimonianze"
      aria-labelledby="testimonials-title"
      className="parallax-section min-h-dvh bg-canvas px-6 py-28">
      <div
        className={cn(
          "parallax-content mx-auto max-w-4xl",
          visible.has("testimonianze") && "visible"
        )}>
        <h2 id="testimonials-title" className="section-title mb-12">
          {t("title")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {TESTIMONIAL_REELS.map((reel, index) => (
            <div
              key={reel.id}
              className="aspect-[9/16] overflow-hidden rounded-2xl border border-white/20 bg-surface">
              {reel.videoSrc ? (
                <video
                  controls
                  playsInline
                  preload="none"
                  src={reel.videoSrc}
                  poster={reel.posterSrc}
                  aria-label={t("videoLabel", { number: index + 1 })}
                  className="size-full object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-3 text-center text-white">
                  <span className="font-mono text-xs tracking-widest" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm">{t("comingSoon")}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
