import type { ValidationMessageKey } from "@/types/forms";

export function getValidationMessage(
  translate: (key: ValidationMessageKey) => string,
  key: string | undefined,
  fallbackKey: ValidationMessageKey
) {
  return translate((key as ValidationMessageKey | undefined) ?? fallbackKey);
}
