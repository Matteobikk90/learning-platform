import { LEGAL_PATHS } from "@/constants/legal";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="site-footer border-t border-stroke bg-surface px-6 py-5 sm:px-8">
      <div className="mx-auto flex min-h-9 max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
        <nav
          aria-label={t("legalNavigation")}
          className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white">
          <Link href={LEGAL_PATHS.terms} className="underline-offset-4 hover:underline">
            {t("terms")}
          </Link>
          <Link href={LEGAL_PATHS.privacy} className="underline-offset-4 hover:underline">
            {t("privacy")}
          </Link>
          <Link href={LEGAL_PATHS.withdrawal} className="underline-offset-4 hover:underline">
            {t("withdrawal")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
