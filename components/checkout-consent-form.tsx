"use client";

import { SubmitButton } from "@/components/submit-button";
import { CHECKOUT_CONSENT_FIELDS, LEGAL_PATHS } from "@/constants/legal";
import { useFormAction } from "@/hooks/use-form-action";
import { Link } from "@/i18n/navigation";
import type { CheckoutConsentFormProps } from "@/types/checkout";
import { useTranslations } from "next-intl";

export function CheckoutConsentForm({ action }: CheckoutConsentFormProps) {
  const t = useTranslations("Checkout");
  const [state, formAction] = useFormAction(action);

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-4 border-0 p-0">
        <legend className="sr-only">{t("legalConfirmations")}</legend>

        <div className="flex items-start gap-3">
          <input
            id={CHECKOUT_CONSENT_FIELDS.terms}
            name={CHECKOUT_CONSENT_FIELDS.terms}
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0 accent-white"
          />
          <label
            htmlFor={CHECKOUT_CONSENT_FIELDS.terms}
            className="text-xs leading-relaxed text-muted">
            {t.rich("termsConsent", {
              terms: (chunks) => (
                <Link
                  href={LEGAL_PATHS.terms}
                  target="_blank"
                  className="text-white underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id={CHECKOUT_CONSENT_FIELDS.immediateAccess}
            name={CHECKOUT_CONSENT_FIELDS.immediateAccess}
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0 accent-white"
          />
          <label
            htmlFor={CHECKOUT_CONSENT_FIELDS.immediateAccess}
            className="text-xs leading-relaxed text-muted">
            {t("immediateAccessConsent")}
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id={CHECKOUT_CONSENT_FIELDS.withdrawalWaiver}
            name={CHECKOUT_CONSENT_FIELDS.withdrawalWaiver}
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0 accent-white"
          />
          <label
            htmlFor={CHECKOUT_CONSENT_FIELDS.withdrawalWaiver}
            className="text-xs leading-relaxed text-muted">
            {t.rich("withdrawalWaiverConsent", {
              policy: (chunks) => (
                <Link
                  href={LEGAL_PATHS.withdrawal}
                  target="_blank"
                  className="text-white underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </label>
        </div>
      </fieldset>

      <p className="text-xs leading-relaxed text-subtle">
        {t.rich("privacyNotice", {
          privacy: (chunks) => (
            <Link
              href={LEGAL_PATHS.privacy}
              target="_blank"
              className="text-muted underline underline-offset-2">
              {chunks}
            </Link>
          ),
        })}
      </p>

      <SubmitButton
        pendingLabel={t("openingCheckout")}
        className="btn-primary w-full">
        {t("continueToPayment")}
      </SubmitButton>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
