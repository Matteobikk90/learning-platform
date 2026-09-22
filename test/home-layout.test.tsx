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
import { HomeSections } from "@/components/home-sections";
import { Navbar } from "@/components/navbar";
import messages from "@/messages/it.json";
import { prisma } from "@/lib/prisma";

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
  ResponsiveBackgroundImage: ({ sizes, className }: { sizes?: string; className?: string }) => (
    <div data-background-sizes={sizes} data-background-class={className} />
  ),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => createElement("a", props),
  usePathname: () => "/",
}));

vi.mock("@/components/navbar-auth", () => ({ NavbarAuth: () => null }));
vi.mock("@/components/language-toggle", () => ({ LanguageToggle: () => null }));

describe("home layout", () => {
  it("renders the six sections in a single main without duplicating navigation or footer", async () => {
    const page = await Home();

    expect(page.type).toBe(HomeSections);
    expect(Children.toArray(page.props.children).filter(isValidElement).map((child) => child.type)).toEqual([
      Hero, Benefici, Corsi, Testimonianze, ChiSono, Faq,
    ]);
  });

  it("does not request prices or purchase state for the home banners", async () => {
    await Home();
    expect(prisma.course.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      select: { id: true, title: true, description: true, coverImageUrl: true },
    }));
    expect(prisma.purchase.findMany).not.toHaveBeenCalled();
  });

  it("keeps a semantic main and visible content before animations load", () => {
    const html = renderToStaticMarkup(<HomeSections><section data-reveal>Contenuto</section></HomeSections>);

    expect(html).toContain('<main class="marketing-page">');
    expect(html).toContain("Contenuto");
    expect(html).not.toContain("opacity");
    expect(html).not.toContain("hidden");
  });

  it("keeps three scroll-driven benefit panels without manual carousel controls", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider locale="it" messages={messages} timeZone="Europe/Rome">
        <Benefici />
      </NextIntlClientProvider>
    );

    expect(html.match(/class="benefits-panel"/g)).toHaveLength(3);
    expect(html).toContain('--benefit-count:3');
    expect(html.match(/class="benefits-track"/g)).toHaveLength(1);
    expect(html).toContain('<div class="benefits-track"><div class="benefits-panorama" aria-hidden="true">');
    expect(html.match(/data-background-sizes="300vw"/g)).toHaveLength(1);
    expect(html).toContain('class="benefits-progress" aria-hidden="true"');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("benefits-controls");
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
    expect(html).toContain("absolute bottom-6 left-1/2");
    expect(html).toContain('class="hero-scroll-line h-8 w-px bg-white/25" aria-hidden="true"');
    expect(html).toContain("h-[calc(100%+var(--site-header-height))]");
    expect(html).not.toContain("overflow-hidden");
  });

  it("keeps the shared header translucent without dimming its contents", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider locale="it" messages={messages} timeZone="Europe/Rome">
        <Navbar />
      </NextIntlClientProvider>
    );

    expect(html).toContain("bg-black/70");
    expect(html).toContain("sm:bg-black/45");
    expect(html).toContain('href="#hero"');
    expect(html).not.toContain("bg-black/85");
    expect(html).not.toContain("opacity-");
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
