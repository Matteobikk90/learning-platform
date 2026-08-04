"use client";

import { useActionState } from "react";

import { INITIAL_FORM_STATE } from "@/constants/forms";
import type { FormAction } from "@/types/forms";

export function useFormAction(action: FormAction) {
  return useActionState(action, INITIAL_FORM_STATE);
}
