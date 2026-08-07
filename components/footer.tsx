import { LEGAL_PATHS } from "@/constants/legal";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="site-footer border-t border-stroke bg-surface px-6 py-7 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-subtle">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
        <nav
          aria-label={t("legalNavigation")}
          className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted">
          <Link href={LEGAL_PATHS.terms} className="hover:text-white">
            {t("terms")}
          </Link>
          <Link href={LEGAL_PATHS.privacy} className="hover:text-white">
            {t("privacy")}
          </Link>
          <Link href={LEGAL_PATHS.withdrawal} className="hover:text-white">
            {t("withdrawal")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
