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
    title: "Evidenza Clinica",
    body: "Ogni modulo si fonda su vent'anni di esperienza terapeutica e studio biomeccanico del movimento umano. Un approccio rigoroso e privo di derive commerciali, dove ogni tecnica è spiegata con logica clinica.",
  },
  {
    num: "02",
    title: "Sistema Nervoso Autonomo",
    body: "Protocolli avanzati per il controllo dell'omeostasi: down-regulation profonda per abbattere il cortisolo, ottimizzare la variabilità della frequenza cardiaca e avviare un reset biologico profondo.",
  },
  {
    num: "03",
    title: "Integrazione Biomeccanica",
    body: "L'unione tra la scienza del respiro e la precisione osteopatica genera un impatto diretto su postura, espansione toracica, efficienza cardiovascolare e longevità sistemica.",
  },
];

export const FAQ_ITEMS = [
  {
    q: "In cosa consiste il metodo e come unisce scienza e discipline orientali?",
    a: "L'approccio unisce i benefici millenari dello Yoga e del Breathwork alla precisione dell'Osteopatia e della biomeccanica. Ogni tecnica è spiegata con logica clinica per darti benefici concreti, misurabili e duraturi.",
  },
  {
    q: "I corsi sono adatti anche a chi non ha mai praticato tecniche di respiro?",
    a: "Assolutamente sì. I corsi sono strutturati in modo progressivo e modulabile in base al tuo livello di partenza, con percorsi guidati passo dopo passo sia per principianti che per praticanti avanzati.",
  },
  {
    q: "Ho problemi posturali o dolori cronici. Posso seguire i corsi?",
    a: "Sì. Come osteopata, i flussi di movimento sono stati progettati rispettando l'anatomia e la fisiologia del corpo. Per patologie gravi o acute è sempre consigliato un consulto preliminare con il proprio medico.",
  },
  {
    q: "Quanto tempo devo dedicare per vedere i primi risultati?",
    a: "La costanza vince sulla quantità. Trovi pratiche da 10–15 minuti e percorsi completi da 45–60 minuti. Già dopo le prime sessioni di Breathwork noterai una riduzione dello stress e una maggiore chiarezza mentale.",
  },
  {
    q: "Che differenza c'è tra i corsi registrati e le sessioni live?",
    a: "I corsi registrati ti danno totale libertà di gestire il tempo, rivedendo i video quando vuoi. Le sessioni live permettono interazione diretta, domande specifiche e feedback personalizzati su postura e ritmo del respiro.",
  },
  {
    q: "Cos'è il Breathwork e perché è importante dal punto di vista clinico?",
    a: "Il Breathwork è il lavoro consapevole sul respiro. Scientificamente, influenza il sistema nervoso autonomo, la frequenza cardiaca e il cortisolo. È una riprogrammazione neurobiologica per migliorare energia, focus e salute sistemica.",
  },
  {
    q: "Sono un atleta di alto livello: come può migliorare le mie prestazioni?",
    a: "Il metodo agisce su tre pilastri: efficienza biomeccanica e posturale, gestione del Sistema Nervoso Autonomo (switch rapido sympathetic/parasympathetic) e tolleranza alla CO₂ per ritardare la fatica e mantenere il focus sotto sforzo massimale.",
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
