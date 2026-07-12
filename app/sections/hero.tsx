import { cn } from "@/lib/cn";
import type { HeroSectionProps } from "@/types/parallax";

export function Hero({ visible, scrollTo }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="parallax-section min-h-dvh bg-navy flex flex-col justify-center px-6 relative">
      <div
        className={cn(
          "parallax-content w-full max-w-6xl mx-auto text-left",
          visible.has("hero") && "visible"
        )}>
        <span className="label-upper mb-8">Osteopatia, Yoga & Breathwork</span>
        <h1 className="hero-title mb-8">
          Riprogramma il tuo respiro.
          <br />
          Trasforma la tua vita.
          <br />
          <span className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <em>Per davvero.</em>
            <button onClick={() => scrollTo("corsi")} className="btn-primary">
              Scopri di più
            </button>
          </span>
        </h1>
        <p
          className="label-upper leading-5"
          style={{ color: "rgba(255,255,255,0.45)" }}>
          Il mio metodo. 20 anni di ricerca clinica.
          <br />
          Alta formazione in Osteopatia, Chinesiologia e Yoga Tradizionale.
          <br />A tua disposizione.
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "rgba(255,255,255,0.25)" }}>
        <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase">
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
