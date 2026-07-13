"use client";

import { SECTIONS } from "@/constants/parallax";
import type { ParallaxNavProps } from "@/types/parallax";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function ParallaxNav({ active, isDark, scrollTo }: ParallaxNavProps) {
  const { data: session } = useSession();

  const textColor = isDark ? "rgba(255,255,255,0.9)" : "var(--color-navy)";
  const dotActive = isDark ? "#ffffff" : "var(--color-navy)";
  const dotInactive = isDark
    ? "rgba(255,255,255,0.28)"
    : "color-mix(in srgb, var(--color-navy) 25%, transparent)";

  return (
    <>
      {/* ── Overlay header ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ color: textColor, transition: "color 0.5s ease" }}>
        <button
          onClick={() => scrollTo("hero")}
          className="nav-brand hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: "inherit", background: "none", border: "none" }}>
          Umberto Iglina
        </button>

        {session ? (
          <div className="flex items-center gap-5">
            <Link
              href="/profile"
              className="nav-link hover:opacity-70 transition-opacity no-underline"
              style={{ color: "inherit" }}>
              I miei corsi
            </Link>
            <Link
              href="/api/auth/signout"
              className="nav-link hover:opacity-70 transition-opacity no-underline"
              style={{ color: "inherit" }}>
              Esci
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="font-mono text-[0.75rem] tracking-[0.15em] uppercase hover:opacity-70 transition-opacity no-underline"
            style={{ color: "inherit" }}>
            Accedi
          </Link>
        )}
      </nav>

      {/* ── Section dots ───────────────────────────────────────────── */}
      <ul className="fixed right-7 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => scrollTo(id)}
              title={label}
              className="size-[7px] rounded-full border-0 p-0 cursor-pointer transition-all duration-300"
              style={{
                background: active === id ? dotActive : dotInactive,
                transform: active === id ? "scale(1.5)" : "scale(1)",
              }}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
