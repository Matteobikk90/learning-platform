import heroDesktop from "@/public/images/home/hero-desktop.jpg";
import heroMobile from "@/public/images/home/hero-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { cn } from "@/lib/cn";
import type { HeroSectionProps } from "@/types/parallax";

export function Hero({ visible, scrollTo }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="parallax-section relative flex min-h-dvh flex-col justify-center overflow-hidden bg-navy px-6">
      <ResponsiveBackgroundImage
        desktopSrc={heroDesktop}
        mobileSrc={heroMobile}
        priority
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-black/35"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.78) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "parallax-content relative z-10 mx-auto w-full max-w-6xl text-left",
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
        <p className="label-upper leading-5 text-white/45">
          Il mio metodo. 20 anni di ricerca clinica.
          <br />
          Alta formazione in Osteopatia, Chinesiologia e Yoga Tradizionale.
          <br />A tua disposizione.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40">
        <span className="font-mono text-[0.625rem] tracking-[0.25em] uppercase">
          Scorri
        </span>
        <div className="w-px h-10 overflow-hidden bg-white/10">
          <div className="w-full h-full parallax-scroll-line bg-white/55" />
        </div>
      </div>
    </section>
  );
}
