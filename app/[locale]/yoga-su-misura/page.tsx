import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getPageAlternates } from "@/functions/seo/get-localized-alternates";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { LocaleRouteProps } from "@/types/i18n";

export async function generateMetadata({
  params,
}: LocaleRouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Yoga" });

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: getPageAlternates(locale, routing.locales, "/yoga-su-misura"),
  };
}

export default async function YogaSuMisura({ params }: LocaleRouteProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Yoga" });

  return (
    <main className="marketing-page mx-auto max-w-6xl px-6 py-12 text-white sm:px-8 sm:py-20">
      <Link href="/#corsi" className="back-link text-white">
        ← {t("back")}
      </Link>
      <div className="grid items-start gap-10 sm:gap-14 md:grid-cols-2 lg:gap-20">
        <header className="md:pt-10">
          <h1 className="hero-title mb-6">{t("title")}</h1>
          <p className="text-xl leading-relaxed sm:text-2xl">{t("subtitle")}</p>
          <p className="mt-10 border-t border-white/20 pt-8 text-base leading-relaxed">{t("body")}</p>
        </header>
        <video
          controls
          playsInline
          preload="none"
          src="/videos/yoga-su-misura.mp4"
          poster="/images/home/yoga-su-misura-poster.jpg"
          aria-label={t("videoLabel")}
          className="mx-auto aspect-[9/16] w-full max-w-md rounded-2xl border border-white/20 bg-surface object-contain">
          <a href="/videos/yoga-su-misura.mp4">{t("openVideo")}</a>
        </video>
      </div>
    </main>
  );
}
