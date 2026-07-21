"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  title?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Salvataggio…",
  className = "btn-primary",
  title,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      title={title}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
