import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL_DOCUMENT_VERSION } from "@/constants/legal";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function WithdrawalPage() {
  const t = await getTranslations("Legal");

  return (
    <LegalPage
      eyebrow={t("withdrawal.eyebrow")}
      title={t("withdrawal.title")}
      draftNotice={t("draftNotice")}
      updatedLabel={t("versionLabel")}
      updatedAt={LEGAL_DOCUMENT_VERSION}
      sections={[
        {
          title: t("withdrawal.periodTitle"),
          paragraphs: [t("withdrawal.periodBody")],
        },
        {
          title: t("withdrawal.digitalTitle"),
          paragraphs: [t("withdrawal.digitalBody")],
        },
        {
          title: t("withdrawal.exerciseTitle"),
          paragraphs: [t("withdrawal.exerciseBody")],
        },
        {
          title: t("withdrawal.defectsTitle"),
          paragraphs: [t("withdrawal.defectsBody")],
        },
      ]}
      action={
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl text-white">
              {t("withdrawal.actionTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t("withdrawal.actionDescription")}
            </p>
          </div>
          <Link href="/profile/purchases" className="btn-primary">
            {t("withdrawal.actionLabel")}
          </Link>
        </div>
      }
    />
  );
}
