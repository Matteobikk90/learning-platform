import { NavbarAuth } from "@/components/navbar-auth";
import { LanguageToggle } from "@/components/language-toggle";
import { Link } from "@/i18n/navigation";

export function Navbar() {
  return (
    <header className="bg-surface border-b border-stroke site-header">
      <div className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link
          href="/"
          className="nav-brand text-white no-underline">
          Umberto Iglina
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          <NavbarAuth />
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
