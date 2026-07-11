// Temporary visual-verification route with mock data (DB unreachable).
// Delete this file after checking the landing page.
import { Parallax } from "@/components/parallax";

const MOCK_COURSES = [
  {
    id: "mock-1",
    title: "NeuroBreathMethod",
    description:
      "Il protocollo completo di respirazione clinica: neuromodulazione, performance e gestione dello stress.",
    price: 19700,
    coverImageUrl: null,
  },
  {
    id: "mock-2",
    title: "Yoga su Misura",
    description:
      "Lo Yoga Tradizionale incontra la precisione osteopatica: un percorso costruito sul tuo corpo.",
    price: 14700,
    coverImageUrl: null,
  },
];

export default function DevPreview() {
  return <Parallax courses={MOCK_COURSES} purchasedIds={[]} />;
}
