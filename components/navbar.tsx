import { NavbarAuth } from "@/components/navbar-auth";
import { NavbarBrand } from "@/components/navbar-brand";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslations } from "next-intl";

export function Navbar() {
  const t = useTranslations("Navigation");

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/15 bg-black/70 px-6 py-5 backdrop-blur-xl sm:bg-black/45 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        <NavbarBrand />

        <nav aria-label={t("mainLabel")} className="flex shrink-0 items-center gap-1.5 sm:gap-5">
          <NavbarAuth />
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
