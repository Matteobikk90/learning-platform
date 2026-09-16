import { NavbarAuth } from "@/components/navbar-auth";
import { LanguageToggle } from "@/components/language-toggle";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function Navbar() {
  const t = useTranslations("Navigation");

  return (
    <header className="site-header sticky top-0 z-50 border-b border-stroke bg-black/85 px-6 py-5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/#top"
          className="nav-brand text-white no-underline">
          Umberto Iglina
        </Link>

        <nav aria-label={t("mainLabel")} className="flex shrink-0 items-center gap-3 sm:gap-5">
          <NavbarAuth />
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
