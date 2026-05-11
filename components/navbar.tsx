import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-surface border-b border-stroke">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-2xl font-semibold text-navy tracking-[0.04em] no-underline">
          Umberto Iglina Yoga
        </Link>

        <nav className="flex items-center gap-6">
          {session ? (
            <>
              <Link
                href="/profile"
                className="text-[0.75rem] font-medium tracking-widest uppercase text-muted no-underline">
                I miei corsi
              </Link>
              <Link
                href="/api/auth/signout"
                className="text-[0.75rem] font-medium tracking-widest uppercase text-subtle no-underline">
                Esci
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn-primary">
              Accedi
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
