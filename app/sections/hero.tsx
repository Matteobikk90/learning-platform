import heroDesktop from "@/public/images/home/hero-desktop.jpg";
import heroMobile from "@/public/images/home/hero-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { cn } from "@/lib/cn";
import type { HeroSectionProps } from "@/types/parallax";
import { useTranslations } from "next-intl";

export function Hero({ visible, scrollTo }: HeroSectionProps) {
  const t = useTranslations("Home.hero");

  return (
    <section
      id="hero"
      className="parallax-section relative flex min-h-dvh flex-col overflow-hidden bg-navy px-6 pt-24 pb-8 sm:pt-28 sm:pb-10">
      <ResponsiveBackgroundImage
        desktopSrc={heroDesktop}
        mobileSrc={heroMobile}
        priority
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        className={cn(
          "parallax-content relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-6 text-left",
          visible.has("hero") && "visible"
        )}>
        <span className="label-upper mb-6">{t("eyebrow")}</span>
        <h1 className="hero-title hero-heading mb-6">
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
          <em className="mt-5 block sm:mt-7">{t("titleEmphasis")}</em>
        </h1>
        <p className="label-upper leading-6 text-white">
          {t("introLine1")}
          <br />
          {t("introLine2")}
          <br />
          {t("introLine3")}
        </p>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-end justify-between gap-6">
        <button type="button" onClick={() => scrollTo("corsi")} className="btn-primary">
          {t("cta")}
        </button>
        <div className="flex flex-col items-center gap-2 pr-6 text-white">
          <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase">
            {t("scroll")}
          </span>
          <div className="h-10 w-px overflow-hidden bg-white/20">
            <div className="parallax-scroll-line size-full bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
