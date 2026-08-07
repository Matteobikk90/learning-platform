import { FaqItem } from "@/components/parallax/faq-item";
import { cn } from "@/lib/cn";
import type {
  BaseSectionProps,
  FaqContent,
  TestimonialContent,
} from "@/types/parallax";
import { useTranslations } from "next-intl";

export function Faq({ visible }: BaseSectionProps) {
  const t = useTranslations("Home.faq");
  const items = t.raw("items") as FaqContent[];
  const testimonials = t.raw("testimonials") as TestimonialContent[];

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
          <div>
            <span className="label-upper">{t("eyebrow")}</span>
            <h2 className="section-title-sm mb-10">
              {t("title")}
              <br />
              <em>{t("titleEmphasis")}</em>
            </h2>
            <div>
              {items.map(({ question, answer }) => (
                <FaqItem
                  key={question}
                  question={question}
                  answer={answer}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="label-upper">{t("testimonialsEyebrow")}</span>
            <h2 className="section-title-sm mb-10">
              {t("testimonialsTitle")}
              <br />
              <em>{t("testimonialsEmphasis")}</em>
            </h2>
            <div className="space-y-8">
              {testimonials.map(({ name, text }) => (
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

      </div>
    </section>
  );
}
