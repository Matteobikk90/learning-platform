import { NavbarAuth } from "@/components/navbar-auth";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="bg-surface border-b border-stroke site-header">
      <div className="flex items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="nav-brand text-navy no-underline">
          Umberto Iglina
        </Link>

        <nav className="flex items-center gap-5">
          <NavbarAuth />
        </nav>
      </div>
    </header>
  );
}
