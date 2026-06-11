import { cn } from "@/lib/cn";
import type { HeroSectionProps } from "@/types/parallax";

export function Hero({ visible, scrollTo }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="parallax-section min-h-dvh bg-navy flex flex-col items-center justify-center text-center px-6 relative">
      <div
        className={cn("parallax-content", visible.has("hero") && "visible")}>
        <span className="label-upper mb-8">Piattaforma di apprendimento</span>
        <h1 className="hero-title mb-8">
          Scopri il tuo
          <br />
          <em>percorso nello yoga</em>
        </h1>
        <p
          className="text-[0.9375rem] leading-[1.9] mb-12 mx-auto"
          style={{ color: "rgba(255,255,255,0.45)", maxWidth: "40ch" }}>
          Corsi pensati per guidarti in ogni fase della pratica,
          <br />
          dal primo respiro alla consapevolezza profonda.
        </p>
        <button onClick={() => scrollTo("corsi")} className="btn-primary">
          Scopri i corsi
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "rgba(255,255,255,0.25)" }}>
        <span className="text-[0.58rem] tracking-[0.25em] uppercase">
          Scorri
        </span>
        <div
          className="w-px h-10 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="w-full h-full parallax-scroll-line"
            style={{ background: "rgba(255,255,255,0.55)" }}
          />
        </div>
      </div>
    </section>
  );
}
