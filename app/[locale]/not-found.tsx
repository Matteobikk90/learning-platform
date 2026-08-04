import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Errors");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="label-upper">404</span>
      <h1 className="page-title">{t("notFoundTitle")}</h1>
      <p className="mb-8 text-sm text-muted">
        {t("notFoundDescription")}
      </p>
      <Link href="/" className="btn-primary">
        {t("backHome")}
      </Link>
    </main>
  );
}
