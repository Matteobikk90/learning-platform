import { SECTIONS } from "@/constants/parallax";
import type { ParallaxNavProps } from "@/types/parallax";
import Link from "next/link";

export function ParallaxNav({ active, isDark, scrollTo }: ParallaxNavProps) {
  const textColor = isDark ? "rgba(255,255,255,0.9)" : "var(--color-navy)";
  const dotActive = isDark ? "#ffffff" : "var(--color-navy)";
  const dotInactive = isDark ? "rgba(255,255,255,0.28)" : "rgba(13,34,64,0.25)";

  return (
    <>
      {/* ── Overlay header ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ color: textColor, transition: "color 0.5s ease" }}>
        <button
          onClick={() => scrollTo("hero")}
          className="font-display text-xl font-semibold tracking-[0.04em] hover:opacity-70 transition-opacity"
          style={{
            color: "inherit",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}>
          Umberto Iglina Yoga
        </button>
        <Link
          href="/login"
          className="text-[0.68rem] font-semibold tracking-[0.15em] uppercase hover:opacity-70 transition-opacity no-underline"
          style={{ color: "inherit" }}>
          Accedi
        </Link>
      </nav>

      {/* ── Section dots ───────────────────────────────────────────── */}
      <ul className="fixed right-7 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => scrollTo(id)}
              title={label}
              className="rounded-full transition-all duration-300"
              style={{
                width: "7px",
                height: "7px",
                background: active === id ? dotActive : dotInactive,
                transform: active === id ? "scale(1.5)" : "scale(1)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
