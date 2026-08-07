import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL_DOCUMENT_VERSION } from "@/constants/legal";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("Legal");

  return (
    <LegalPage
      eyebrow={t("privacy.eyebrow")}
      title={t("privacy.title")}
      draftNotice={t("draftNotice")}
      updatedLabel={t("versionLabel")}
      updatedAt={LEGAL_DOCUMENT_VERSION}
      sections={[
        {
          title: t("privacy.controllerTitle"),
          paragraphs: [t("privacy.controllerBody")],
        },
        {
          title: t("privacy.dataTitle"),
          paragraphs: [
            t("privacy.dataBody"),
            t("privacy.providersBody"),
          ],
        },
        {
          title: t("privacy.rightsTitle"),
          paragraphs: [t("privacy.rightsBody")],
        },
      ]}
    />
  );
}
