export const CREATE_MODULE_FORM_VALUE_FIELDS = ["title", "order"] as const;

export const UPDATE_MODULE_FORM_VALUE_FIELDS = [
  "title",
  "order",
] as const;

export const MODULE_FORM_ERRORS = {
  courseNotFound: "Corso non trovato",
  duplicateOrder: "Esiste già un modulo con questo ordine",
  invalidData: "Dati del modulo non validi",
  notFound: "Modulo non trovato",
} as const;

export const MAX_MODULE_DURATION_SECONDS = 12 * 60 * 60;
