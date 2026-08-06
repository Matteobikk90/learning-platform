"use client";

import { SubmitButton } from "@/components/submit-button";
import { PROFILE_NAME_MAX_LENGTH } from "@/constants/profile";
import { updateProfile } from "@/features/profile/actions";
import { useFormAction } from "@/hooks/use-form-action";
import type { ProfileFormProps } from "@/types/profile";
import { useTranslations } from "next-intl";

export function ProfileForm({ email, name }: ProfileFormProps) {
  const t = useTranslations("Profile");
  const [state, formAction] = useFormAction(updateProfile);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="profile-name" className="form-label">
          {t("name")}
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={PROFILE_NAME_MAX_LENGTH}
          defaultValue={state.values?.name ?? name}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="profile-email" className="form-label">
          {t("email")}
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          readOnly
          className="form-input cursor-not-allowed opacity-70"
        />
        <p className="mt-2 text-xs leading-relaxed text-subtle">
          {t("emailDescription")}
        </p>
      </div>

      <SubmitButton pendingLabel={t("savingProfile")}>
        {t("saveProfile")}
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
