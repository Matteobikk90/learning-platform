import { Children, createElement, isValidElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import Home from "@/app/[locale]/page";
import { Benefici } from "@/app/sections/benefici";
import { ChiSono } from "@/app/sections/chi-sono";
import { Corsi } from "@/app/sections/corsi";
import { Faq } from "@/app/sections/faq";
import { Hero } from "@/app/sections/hero";
import { Testimonianze } from "@/app/sections/testimonianze";
import { FaqItem } from "@/components/faq-item";
import messages from "@/messages/it.json";

vi.mock("@/lib/session", () => ({
  getAppSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findMany: vi.fn().mockResolvedValue([]) },
    purchase: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock("@/components/responsive-background-image", () => ({
  ResponsiveBackgroundImage: () => null,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => createElement("a", props),
}));

describe("home layout", () => {
  it("renders the six sections in a single main without duplicating navigation or footer", async () => {
    const page = await Home();

    expect(page.type).toBe("main");
    expect(Children.toArray(page.props.children).filter(isValidElement).map((child) => child.type)).toEqual([
      Hero, Benefici, Corsi, Testimonianze, ChiSono, Faq,
    ]);
  });

  it("places the hero CTA after the introduction and uses native section links", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider locale="it" messages={messages} timeZone="Europe/Rome">
        <Hero />
      </NextIntlClientProvider>
    );

    expect(html.indexOf('href="#corsi"')).toBeGreaterThan(html.indexOf("A tua disposizione."));
    expect(html).toContain('href="#benefici"');
    expect(html).not.toContain("<button");
  });

  it("renders accessible FAQ disclosure without depending on client state", () => {
    const html = renderToStaticMarkup(
      createElement(FaqItem, { question: "Domanda?", answer: "Risposta." })
    );

    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("Domanda?");
    expect(html).toContain("Risposta.");
    expect(html).not.toContain('aria-expanded="false"');
  });
});
