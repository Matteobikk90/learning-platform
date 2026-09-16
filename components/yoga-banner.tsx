import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import yogaBanner from "@/public/images/home/yoga-su-misura.jpg";

export function YogaBanner() {
  const t = useTranslations("Yoga");

  return (
    <article className="overflow-hidden rounded-2xl border border-white/20 bg-surface">
      <Image
        src={yogaBanner}
        alt={t("title")}
        sizes="(max-width: 1200px) calc(100vw - 3rem), 1152px"
        className="h-auto w-full"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-white sm:text-base">{t("subtitle")}</p>
        <Link href="/yoga-su-misura" className="btn-primary" aria-label={t("discoverLabel")}>
          {t("discover")}
        </Link>
      </div>
    </article>
  );
}
