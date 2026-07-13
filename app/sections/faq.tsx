import { FaqItem } from "@/components/parallax/faq-item";
import { FAQ_ITEMS, TESTIMONIALS } from "@/constants/parallax";
import { cn } from "@/lib/cn";
import type { BaseSectionProps } from "@/types/parallax";

export function Faq({ visible }: BaseSectionProps) {
  return (
    <section
      id="faq"
      className="parallax-section min-h-dvh bg-canvas flex flex-col items-center justify-center px-6 py-24">
      <div
        className={cn(
          "parallax-content max-w-5xl w-full",
          visible.has("faq") && "visible"
        )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* FAQ */}
          <div>
            <span className="label-upper">Domande frequenti</span>
            <h2 className="section-title-sm mb-10">
              Hai delle
              <br />
              <em>domande?</em>
            </h2>
            <div>
              {FAQ_ITEMS.map(({ q, a }) => (
                <FaqItem key={q} question={q} answer={a} />
              ))}
            </div>
          </div>

          {/* Esperienze */}
          <div>
            <span className="label-upper">Esperienze</span>
            <h2 className="section-title-sm mb-10">
              Cosa dicono
              <br />
              <em>gli studenti</em>
            </h2>
            <div className="space-y-8">
              {TESTIMONIALS.map(({ name, text }) => (
                <div key={name} className="border-l-2 border-petrol pl-5">
                  <p className="text-sm text-muted leading-[1.9] italic mb-2">
                    &quot;{text}&quot;
                  </p>
                  <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-petrol">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-stroke text-center">
          <p className="text-xs tracking-wider text-muted opacity-50">
            © {new Date().getFullYear()} Umberto Iglina
          </p>
        </div>
      </div>
    </section>
  );
}
