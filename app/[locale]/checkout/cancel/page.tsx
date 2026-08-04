import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CheckoutCancelPage() {
  const t = await getTranslations("Checkout");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="card w-full px-10 py-14">
        <p className="label-upper">{t("cancelled")}</p>

        <h1 className="font-display mt-4 text-5xl text-white">
          {t("noCharge")}
        </h1>

        <p className="mt-6 text-muted">{t("cancelDescription")}</p>

        <div className="mt-10 flex justify-center">
          <Link href="/" className="btn-primary">
            {t("backToCourses")}
          </Link>
        </div>
      </div>
    </main>
  );
}
