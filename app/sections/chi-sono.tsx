import { cn } from "@/lib/cn";
import type { BaseSectionProps } from "@/types/parallax";

export function ChiSono({ visible }: BaseSectionProps) {
  return (
    <section
      id="chi-sono"
      className="parallax-section min-h-dvh bg-navy flex flex-col items-center justify-center px-6 py-24">
      <div
        className={cn("parallax-content max-w-3xl w-full", visible.has("chi-sono") && "visible")}>
        <span className="label-upper mb-8">Chi sono</span>
        <h2 className="section-title text-white mb-10">
          <em>Umberto Iglina</em>
        </h2>
        <div
          className="border-t pt-8"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p
            className="leading-loose text-[0.9375rem] max-w-[60ch]"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Insegnante di yoga con oltre vent'anni di esperienza, mi sono
            formato nelle tradizioni dell'Hatha e dell'Ashtanga yoga. La mia
            pratica è un viaggio continuo di scoperta — fisico, mentale e
            spirituale.
          </p>
          <p
            className="leading-loose text-[0.9375rem] max-w-[60ch] mt-6"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Ho creato questa piattaforma per condividere ciò che ho imparato in
            anni di pratica e insegnamento, rendendolo accessibile a chiunque
            voglia intraprendere questo cammino.
          </p>
        </div>
      </div>
    </section>
  );
}
