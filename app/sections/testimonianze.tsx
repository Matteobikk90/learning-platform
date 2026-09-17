import { useTranslations } from "next-intl";

import { TESTIMONIAL_REELS } from "@/constants/testimonials";

export function Testimonianze() {
  const t = useTranslations("Home.testimonials");

  return (
    <section
      id="testimonianze"
      aria-labelledby="testimonials-title"
      className="home-section bg-canvas">
      <div className="mx-auto w-full max-w-6xl">
        <h2 data-reveal id="testimonials-title" className="section-title mb-10 sm:mb-14">
          {t("title")}
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {TESTIMONIAL_REELS.map((reel, index) => (
            <li
              key={reel.id}
              data-reveal
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
