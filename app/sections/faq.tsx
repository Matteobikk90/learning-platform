import { FaqItem } from "@/components/parallax/faq-item";
import { cn } from "@/lib/cn";
import type { BaseSectionProps, FaqContent } from "@/types/parallax";
import { useTranslations } from "next-intl";

export function Faq({ visible }: BaseSectionProps) {
  const t = useTranslations("Home.faq");
  const items = t.raw("items") as FaqContent[];

  return (
    <section
      id="faq"
      className="parallax-section min-h-dvh bg-canvas flex flex-col items-center justify-center px-6 py-24">
      <div
        className={cn(
          "parallax-content max-w-3xl w-full",
          visible.has("faq") && "visible"
        )}>
        <span className="label-upper">{t("eyebrow")}</span>
        <h2 className="section-title-sm mb-10">
          {t("title")}
          <br />
          <em>{t("titleEmphasis")}</em>
        </h2>
        <div>
          {items.map(({ question, answer }) => (
            <FaqItem key={question} question={question} answer={answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
