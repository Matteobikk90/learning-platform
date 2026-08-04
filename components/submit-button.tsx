"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  title?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  className = "btn-primary",
  title,
}: SubmitButtonProps) {
  const t = useTranslations("Forms");
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      title={title}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? (pendingLabel ?? t("saving")) : children}
    </button>
  );
}
