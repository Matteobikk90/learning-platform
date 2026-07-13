"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function NavbarAuth() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading" || pathname === "/login") return null;

  if (session) {
    return (
      <>
        <Link
          href="/profile"
          className="nav-link text-muted no-underline">
          I miei corsi
        </Link>
        <Link
          href="/api/auth/signout"
          className="nav-link text-subtle no-underline">
          Esci
        </Link>
      </>
    );
  }

  return (
    <Link
      href="/login"
      className="nav-link no-underline hover:opacity-70 transition-opacity text-navy">
      Accedi
    </Link>
  );
}
