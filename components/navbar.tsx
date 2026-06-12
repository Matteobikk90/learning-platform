import { NavbarAuth } from "@/components/navbar-auth";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="bg-surface border-b border-stroke site-header">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-2xl font-semibold text-navy tracking-[0.04em] no-underline">
          Umberto Iglina Yoga
        </Link>

        <nav className="flex items-center gap-6">
          <NavbarAuth />
        </nav>
      </div>
    </header>
  );
}
