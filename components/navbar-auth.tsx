"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function NavbarAuth() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading" || pathname === "/login") return null;

  if (session) {
    return (
      <>
        {session.user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="nav-link text-muted no-underline">
            Admin
          </Link>
        )}
        <Link
          href="/profile"
          className="nav-link text-muted no-underline">
          I miei corsi
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="nav-link cursor-pointer border-0 bg-transparent p-0 text-subtle">
          Esci
        </button>
      </>
    );
  }

  return (
    <Link
      href="/login"
      className="nav-link no-underline hover:opacity-70 transition-opacity text-white">
      Accedi
    </Link>
  );
}
