import type { SectionId } from "@/types/parallax";

export const SECTIONS: { id: SectionId; label: string; dark: boolean }[] = [
  { id: "hero", label: "Home", dark: true },
  { id: "benefici", label: "Benefici", dark: false },
  { id: "corsi", label: "Corsi", dark: false },
  { id: "chi-sono", label: "Chi Sono", dark: true },
  { id: "faq", label: "FAQ", dark: false },
];

export const BENEFITS = [
  {
    num: "01",
    title: "Flessibilità & Forza",
    body: "Un percorso progressivo che costruisce forza e flessibilità attraverso sequenze studiate per ogni livello.",
  },
  {
    num: "02",
    title: "Consapevolezza",
    body: "Tecniche di respirazione e meditazione integrate nella pratica fisica per un benessere completo.",
  },
  {
    num: "03",
    title: "Progressione guidata",
    body: "Moduli video strutturati che ti accompagnano passo dopo passo nel tuo percorso di crescita.",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Per chi sono adatti i corsi?",
    a: "I corsi sono pensati per tutti i livelli, dal principiante assoluto al praticante avanzato.",
  },
  {
    q: "Come accedo ai video?",
    a: "Dopo l'acquisto, i video sono disponibili immediatamente nella tua area personale.",
  },
  {
    q: "Posso seguire da casa?",
    a: "Sì, i corsi sono progettati per essere seguiti ovunque, con spazio minimo necessario.",
  },
  {
    q: "C'è un limite di tempo per i video?",
    a: "No, una volta acquistato hai accesso illimitato al corso.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sara M.",
    text: "Ho iniziato senza alcuna esperienza e dopo tre mesi riesco a fare posizioni che non avrei mai immaginato.",
  },
  {
    name: "Luca P.",
    text: "La qualità dei video e la progressione dei corsi è eccellente. Mi sento guidato ad ogni passo.",
  },
  {
    name: "Giulia R.",
    text: "Umberto spiega con una chiarezza e una passione che ti trasmette energia. Consigliatissimo!",
  },
];
