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
          className="text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-muted no-underline">
          I miei corsi
        </Link>
        <Link
          href="/api/auth/signout"
          className="text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-subtle no-underline">
          Esci
        </Link>
      </>
    );
  }

  return (
    <Link
      href="/login"
      className="text-[0.75rem] font-semibold tracking-[0.15em] uppercase no-underline hover:opacity-70 transition-opacity"
      style={{ color: "var(--color-navy)" }}>
      Accedi
    </Link>
  );
}
