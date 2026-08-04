export type FormValues = Record<string, string>;

export type FormState = {
  error: string | null;
  values?: FormValues;
};

export type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;
