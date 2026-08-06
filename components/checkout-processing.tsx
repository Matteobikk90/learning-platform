import { getTranslations } from "next-intl/server";

import type { CheckoutProcessingProps } from "@/types/checkout";

export async function CheckoutProcessing({ sessionId }: CheckoutProcessingProps) {
  const t = await getTranslations("Checkout");
  const retryHref = `?session_id=${encodeURIComponent(sessionId)}`;

  return (
    <a
      href={retryHref}
      className="mt-7 inline-block font-mono text-xs uppercase tracking-widest text-white underline underline-offset-4">
      {t("checkAgain")}
    </a>
  );
}
