export const COURSE_FORM_VALUE_FIELDS = [
  "title",
  "description",
  "price",
] as const;

export const COURSE_FORM_ERRORS = {
  invalidData: "Dati del corso non validi",
  invalidImage: "L’immagine deve essere caricata dalla piattaforma",
  notFound: "Corso non trovato",
} as const;

export const COURSE_IMAGE_ERRORS = {
  invalidResponse: "Risposta del server non valida",
  invalidSize: "L’immagine deve pesare meno di 5 MB.",
  invalidType: "Sono supportati soltanto JPG, PNG, WebP e AVIF.",
  uploadFailed: "Impossibile caricare l’immagine",
} as const;

export const COURSE_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const COURSE_IMAGES_BUCKET = "course-images";
export const COURSE_IMAGES_PUBLIC_PATH =
  `/storage/v1/object/public/${COURSE_IMAGES_BUCKET}/`;

export const COURSE_IMAGE_ALLOWED_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
