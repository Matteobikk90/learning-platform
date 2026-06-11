import { cn } from "@/lib/cn";
import { BENEFITS } from "@/constants/parallax";
import type { BaseSectionProps } from "@/types/parallax";

export function Benefici({ visible }: BaseSectionProps) {
  return (
    <section
      id="benefici"
      className="parallax-section min-h-dvh bg-canvas flex flex-col items-center justify-center px-6 py-24">
      <div
        className={cn("parallax-content max-w-5xl w-full", visible.has("benefici") && "visible")}>
        <div className="text-center mb-16">
          <span className="label-upper">I tuoi benefici</span>
          <h2 className="section-title">
            Cosa troverai
            <br />
            <em>nei nostri corsi</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BENEFITS.map(({ num, title, body }) => (
            <div key={num} className="border-t-2 border-stroke pt-8">
              <span className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-petrol mb-4 block">
                {num}
              </span>
              <h3 className="font-display text-2xl font-medium text-navy mb-3">
                {title}
              </h3>
              <p className="text-sm text-muted leading-[1.9]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
