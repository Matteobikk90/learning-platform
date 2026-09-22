import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CoursePresentation } from "@/components/course-presentation";
import { YOGA_PRESENTATION } from "@/constants/course-presentations";
import { isSupportedLocale } from "@/functions/i18n/is-supported-locale";
import { getPageAlternates } from "@/functions/seo/get-localized-alternates";
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
    <CoursePresentation
      title={t("title")}
      subtitle={t("subtitle")}
      body={t("body")}
      video={YOGA_PRESENTATION.video}
      videoLabel={t("videoLabel")}
      openVideoLabel={t("openVideo")}
      backLabel={t("back")}
    />
  );
}
