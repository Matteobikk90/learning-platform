import heroDesktop from "@/public/images/home/hero-desktop.jpg";
import heroMobile from "@/public/images/home/hero-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("Home.hero");

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="home-section relative flex items-center overflow-hidden bg-navy px-6 pt-14 pb-28 sm:px-8 sm:pt-20 sm:pb-32">
      <ResponsiveBackgroundImage
        desktopSrc={heroDesktop}
        mobileSrc={heroMobile}
        priority
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div data-reveal className="relative z-10 mx-auto w-full max-w-6xl text-left">
        <span className="label-upper mb-6">{t("eyebrow")}</span>
        <h1 id="hero-title" className="hero-title hero-heading mb-8">
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
          <em className="mt-5 block sm:mt-7">{t("titleEmphasis")}</em>
        </h1>
        <p className="max-w-2xl font-mono text-xs leading-7 tracking-widest text-white uppercase">
          {t("introLine1")}
          <br />
          {t("introLine2")}
          <br />
          {t("introLine3")}
        </p>
        <a href="#corsi" className="btn-primary mt-8">
          {t("cta")}
        </a>
      </div>

      <a
        href="#benefici"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 px-4 py-2 text-white no-underline">
        <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase">
          {t("scroll")}
        </span>
        <span className="h-8 w-px bg-white/60" aria-hidden="true" />
      </a>
    </section>
  );
}
