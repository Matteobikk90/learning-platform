import type { FormValues } from "@/types/forms";

export function captureFormValues(
  formData: FormData,
  keys: readonly string[]
): FormValues {
  return Object.fromEntries(
    keys.map((key) => {
      const value = formData.get(key);
      return [key, typeof value === "string" ? value : ""];
    })
  );
}
