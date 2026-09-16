import { describe, expect, it } from "vitest";

import { SECTIONS } from "@/constants/parallax";
import { TESTIMONIAL_REELS } from "@/constants/testimonials";
import en from "@/messages/en.json";
import itMessages from "@/messages/it.json";

describe("home content", () => {
  it("places testimonials fourth and the introduction fifth", () => {
    expect(SECTIONS.map(({ id }) => id)).toEqual([
      "hero", "benefici", "corsi", "testimonianze", "chi-sono", "faq",
    ]);
    for (const { labelKey } of SECTIONS) {
      expect(itMessages.Navigation[labelKey]).toBeTruthy();
      expect(en.Navigation[labelKey]).toBeTruthy();
    }
  });

  it("preserves the requested Italian copy and editorial line breaks", () => {
    const [clinical, performance, wellbeing] = itMessages.Home.benefits.items;

    expect(clinical.body).toContain("Ogni percorso");
    expect(clinical.body).toContain("biomeccanico\ndel movimento umano");
    expect(performance.title).toBe("Performance nello sport & Qualità della vita");
    expect(performance.body).toContain("impara come calmare la mente nel quotidiano, nelle situazioni");
    expect(wellbeing.body).toContain("Yoga Tradizionale\ne la precisione");
    expect(wellbeing.body).toContain("benessere psicofisico.\nSei pronto");
    expect(itMessages.Home.courses.eyebrow).toBe("Percorsi");
    expect(itMessages.Home.about.welcome).toBe("Benvenuto.");
    expect(itMessages.Home.about.paragraph2).not.toContain("Benvenuto");
  });

  it("reserves six unique reel slots without fabricated testimonials", () => {
    expect(TESTIMONIAL_REELS).toHaveLength(6);
    expect(new Set(TESTIMONIAL_REELS.map(({ id }) => id)).size).toBe(6);
    expect(itMessages.Home.faq).not.toHaveProperty("testimonials");
    expect(en.Home.faq).not.toHaveProperty("testimonials");
  });

  it("provides matching keys for the new sections in both languages", () => {
    expect(Object.keys(itMessages.Yoga).sort()).toEqual(Object.keys(en.Yoga).sort());
    expect(Object.keys(itMessages.Home.testimonials).sort()).toEqual(Object.keys(en.Home.testimonials).sort());
    expect(Object.keys(itMessages.Home.about).sort()).toEqual(Object.keys(en.Home.about).sort());
  });
});
