"use client";

import { SubmitButton } from "@/components/submit-button";
import { PROFILE_NAME_MAX_LENGTH, WITHDRAWAL_REQUEST_FIELDS } from "@/constants/profile";
import { requestWithdrawal } from "@/features/purchases/actions";
import { useFormAction } from "@/hooks/use-form-action";
import type { WithdrawalRequestFormProps } from "@/types/purchase";
import { useTranslations } from "next-intl";

export function WithdrawalRequestForm({
  email,
  name,
  purchaseId,
}: WithdrawalRequestFormProps) {
  const t = useTranslations("Profile");
  const [state, formAction] = useFormAction(requestWithdrawal);
  const nameId = `withdrawal-name-${purchaseId}`;
  const emailId = `withdrawal-email-${purchaseId}`;
  const confirmationId = `withdrawal-confirmation-${purchaseId}`;

  return (
    <form
      action={formAction}
      className="mt-5 space-y-4 border-t border-stroke pt-5">
      <input
        type="hidden"
        name={WITHDRAWAL_REQUEST_FIELDS.purchaseId}
        value={purchaseId}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={nameId} className="form-label">
            {t("withdrawalName")}
          </label>
          <input
            id={nameId}
            name={WITHDRAWAL_REQUEST_FIELDS.requesterName}
            type="text"
            autoComplete="name"
            required
            maxLength={PROFILE_NAME_MAX_LENGTH}
            defaultValue={name}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor={emailId} className="form-label">
            {t("email")}
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            readOnly
            className="form-input cursor-not-allowed opacity-70"
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id={confirmationId}
          name={WITHDRAWAL_REQUEST_FIELDS.confirmed}
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 accent-white"
        />
        <label
          htmlFor={confirmationId}
          className="text-xs leading-relaxed text-muted">
          {t("withdrawalConfirmation")}
        </label>
      </div>

      <SubmitButton
        pendingLabel={t("withdrawalSubmitting")}
        className="btn-secondary">
        {t("withdrawalSubmit")}
      </SubmitButton>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-petrol-light" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
