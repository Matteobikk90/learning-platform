import aboutDesktop from "@/public/images/home/about-desktop.jpg";
import aboutMobile from "@/public/images/home/about-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { cn } from "@/lib/cn";
import type { BaseSectionProps } from "@/types/parallax";
import { useTranslations } from "next-intl";

export function ChiSono({ visible }: BaseSectionProps) {
  const t = useTranslations("Home.about");

  return (
    <section
      id="chi-sono"
      className="parallax-section relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy px-6 py-24">
      <ResponsiveBackgroundImage
        desktopSrc={aboutDesktop}
        mobileSrc={aboutMobile}
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 50%, rgba(0,0,0,0.12) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "parallax-content relative z-10 w-full max-w-6xl",
          visible.has("chi-sono") && "visible"
        )}>
        <div className="max-w-3xl">
          <span className="label-upper mb-8 text-white/60">
            {t("eyebrow")}
          </span>
          <h2 className="section-title mb-10 text-white">
            <em>{t("name")}</em>
          </h2>
          <div className="border-t border-white/20 pt-8">
            <p className="label-upper w-full text-white/65 leading-6">
              {t("paragraph1")}
            </p>
            <p className="label-upper mt-6 w-full text-white/65 leading-6">
              {t("paragraph2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
