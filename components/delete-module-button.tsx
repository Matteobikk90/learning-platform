"use client";

import { deleteModule } from "@/features/modules/delete-actions";
import { useTranslations } from "next-intl";

export function DeleteModuleButton({
  moduleId,
}: {
  moduleId: string;
}) {
  const t = useTranslations("Forms");

  return (
    <form
      action={deleteModule}
      onSubmit={(event) => {
        const confirmed = window.confirm(t("deleteModuleConfirm"));
        if (!confirmed) event.preventDefault();
      }}>
      <input type="hidden" name="moduleId" value={moduleId} />
      <button
        type="submit"
        className="btn-danger">
        {t("deleteModule")}
      </button>
    </form>
  );
}
