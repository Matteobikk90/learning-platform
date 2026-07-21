import aboutDesktop from "@/public/images/home/about-desktop.jpg";
import aboutMobile from "@/public/images/home/about-mobile.jpg";
import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";
import { cn } from "@/lib/cn";
import type { BaseSectionProps } from "@/types/parallax";

export function ChiSono({ visible }: BaseSectionProps) {
  return (
    <section
      id="chi-sono"
      className="parallax-section relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy px-6 py-24">
      <ResponsiveBackgroundImage
        desktopSrc={aboutDesktop}
        mobileSrc={aboutMobile}
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 50%, rgba(0,0,0,0.12) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "parallax-content relative z-10 w-full max-w-6xl",
          visible.has("chi-sono") && "visible"
        )}>
        <div className="max-w-3xl">
          <span className="label-upper mb-8 text-white/60">Mi presento</span>
          <h2 className="section-title mb-10 text-white">
            <em>Umberto Iglina</em>
          </h2>
          <div className="border-t border-white/20 pt-8">
            <p className="label-upper w-full text-white/65 leading-6">
              Come osteopata e specialista nel movimento umano ho sempre cercato
              strumenti che permettessero ai miei pazienti di vivere al meglio.
            </p>
            <p className="label-upper mt-6 w-full text-white/65 leading-6">
              Ho avuto il privilegio di studiare lo Yoga nella sua forma più
              autentica e da oltre 20 anni studio la scienza del respiro.
              Nell&apos;unione di tradizioni millenarie e approccio clinico
              moderno ho scoperto come trasformare concretamente la propria vita.
              Benvenuto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
