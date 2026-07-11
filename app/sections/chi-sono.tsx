import { cn } from "@/lib/cn";
import type { BaseSectionProps } from "@/types/parallax";

export function ChiSono({ visible }: BaseSectionProps) {
  return (
    <section
      id="chi-sono"
      className="parallax-section min-h-dvh bg-navy flex flex-col items-center justify-center px-6 py-24">
      <div
        className={cn("parallax-content max-w-3xl w-full", visible.has("chi-sono") && "visible")}>
        <span className="label-upper mb-8">Mi presento</span>
        <h2 className="section-title text-white mb-10">
          <em>Umberto Iglina</em>
        </h2>
        <div
          className="border-t pt-8"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p
            className="leading-loose text-[0.9375rem] max-w-[60ch]"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Come osteopata e specialista nel movimento umano ho sempre cercato
            strumenti che permettessero ai miei pazienti di vivere al meglio.
          </p>
          <p
            className="leading-loose text-[0.9375rem] max-w-[60ch] mt-6"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Ho avuto il privilegio di studiare lo Yoga nella sua forma più
            autentica e da oltre 20 anni studio la scienza del respiro.
            Nell&apos;unione di tradizioni millenarie e approccio clinico
            moderno ho scoperto come trasformare concretamente la propria vita.
            Benvenuto.
          </p>
        </div>
      </div>
    </section>
  );
}
