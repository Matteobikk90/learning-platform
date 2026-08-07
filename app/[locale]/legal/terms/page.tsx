import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL_DOCUMENT_VERSION } from "@/constants/legal";
import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("Legal");

  return (
    <LegalPage
      eyebrow={t("terms.eyebrow")}
      title={t("terms.title")}
      draftNotice={t("draftNotice")}
      updatedLabel={t("versionLabel")}
      updatedAt={LEGAL_DOCUMENT_VERSION}
      sections={[
        {
          title: t("terms.providerTitle"),
          paragraphs: [t("terms.providerBody")],
        },
        {
          title: t("terms.purchaseTitle"),
          paragraphs: [
            t("terms.purchaseBody"),
            t("terms.paymentBody"),
          ],
        },
        {
          title: t("terms.accessTitle"),
          paragraphs: [
            t("terms.accessBody"),
            t("terms.accountBody"),
          ],
        },
        {
          title: t("terms.liabilityTitle"),
          paragraphs: [t("terms.liabilityBody")],
        },
      ]}
    />
  );
}
