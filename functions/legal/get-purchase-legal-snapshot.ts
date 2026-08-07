import englishMessages from "@/messages/en.json";
import italianMessages from "@/messages/it.json";
import type { Locale } from "@/types/i18n";
import type { LegalSection } from "@/types/legal";

export function getPurchaseLegalSnapshot(locale: Locale): LegalSection[] {
  const legal =
    locale === "en" ? englishMessages.Legal : italianMessages.Legal;

  return [
    {
      title: legal.terms.providerTitle,
      paragraphs: [legal.terms.providerBody],
    },
    {
      title: legal.terms.purchaseTitle,
      paragraphs: [legal.terms.purchaseBody, legal.terms.paymentBody],
    },
    {
      title: legal.terms.accessTitle,
      paragraphs: [legal.terms.accessBody, legal.terms.accountBody],
    },
    {
      title: legal.terms.liabilityTitle,
      paragraphs: [legal.terms.liabilityBody],
    },
    {
      title: legal.withdrawal.periodTitle,
      paragraphs: [legal.withdrawal.periodBody],
    },
    {
      title: legal.withdrawal.digitalTitle,
      paragraphs: [legal.withdrawal.digitalBody],
    },
    {
      title: legal.withdrawal.exerciseTitle,
      paragraphs: [legal.withdrawal.exerciseBody],
    },
    {
      title: legal.withdrawal.defectsTitle,
      paragraphs: [legal.withdrawal.defectsBody],
    },
  ];
}
