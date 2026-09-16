import aboutDesktop from "@/public/images/home/about-desktop.jpg";
import aboutMobile from "@/public/images/home/about-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { useTranslations } from "next-intl";

export function ChiSono() {
  const t = useTranslations("Home.about");

  return (
    <section
      id="chi-sono"
      aria-labelledby="about-title"
      className="home-section relative overflow-hidden bg-navy">
      <ResponsiveBackgroundImage
        desktopSrc={aboutDesktop}
        mobileSrc={aboutMobile}
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <span className="label-upper mb-5 text-white">
            {t("eyebrow")}
          </span>
          <h2 id="about-title" className="section-title mb-10 sm:mb-14">
            <em>{t("name")}</em>
          </h2>
          <div className="space-y-6 border-t border-white/20 pt-8 text-base leading-relaxed text-white sm:pt-10 sm:text-lg">
            <p>
              {t("paragraph1")}
            </p>
            <p>
              {t("paragraph2")}
            </p>
            <p>{t("welcome")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
