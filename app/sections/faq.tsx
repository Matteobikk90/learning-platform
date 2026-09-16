import { FaqItem } from "@/components/faq-item";
import type { FaqContent } from "@/types/home";
import { useTranslations } from "next-intl";

export function Faq() {
  const t = useTranslations("Home.faq");
  const items = t.raw("items") as FaqContent[];

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="home-section bg-canvas">
      <div className="mx-auto grid max-w-6xl gap-10 sm:gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <header>
          <span className="label-upper mb-5">{t("eyebrow")}</span>
          <h2 id="faq-title" className="section-title">
            {t("title")}
            <br />
            <em>{t("titleEmphasis")}</em>
          </h2>
        </header>
        <div className="border-b border-stroke">
          {items.map(({ question, answer }) => (
            <FaqItem key={question} question={question} answer={answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
