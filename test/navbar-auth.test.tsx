import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NavbarAuth } from "@/components/navbar-auth";
import en from "@/messages/en.json";
import itMessages from "@/messages/it.json";
import type { Locale } from "@/types/i18n";

const { useSession, usePathname } = vi.hoisted(() => ({
  useSession: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ useSession, signOut: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({
  usePathname,
  Link: (props: ComponentProps<"a">) => createElement("a", props),
}));

function renderNavigation(locale: Locale = "it") {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "en" ? en : itMessages}
      timeZone="Europe/Rome">
      <NavbarAuth />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  usePathname.mockReturnValue("/");
  useSession.mockReturnValue({ data: null, status: "unauthenticated" });
});

describe("navbar account navigation", () => {
  it.each(["it", "en"] as const)("keeps the admin account icon visible and labelled in %s", (locale) => {
    useSession.mockReturnValue({
      data: { user: { id: "admin-1", role: "ADMIN" } },
      status: "authenticated",
    });

    const html = renderNavigation(locale);
    const accountLink = html.slice(0, html.indexOf("</a>") + 4);
    const messages = locale === "en" ? en : itMessages;

    expect(accountLink).toContain('href="/admin"');
    expect(accountLink).toContain(`aria-label="${messages.Navigation.admin}"`);
    expect(accountLink).toContain(`title="${messages.Navigation.admin}"`);
    expect(accountLink).toContain('class="size-5 shrink-0"');
    expect(accountLink).toContain('<circle cx="12" cy="8" r="4">');
    expect(accountLink).not.toContain("<span");
    expect(accountLink).not.toContain('class="hidden');
    expect(html).not.toContain('href="/profile"');
    expect(html).toContain(`aria-label="${messages.Navigation.logout}"`);
  });

  it.each(["it", "en"] as const)("opens the learner profile with the same account icon in %s", (locale) => {
    useSession.mockReturnValue({
      data: { user: { id: "learner-1", role: "USER" } },
      status: "authenticated",
    });

    const html = renderNavigation(locale);
    const messages = locale === "en" ? en : itMessages;

    expect(html).toContain('href="/profile"');
    expect(html).toContain(`aria-label="${messages.Navigation.myCourses}"`);
    expect(html).toContain('<circle cx="12" cy="8" r="4">');
    expect(html).not.toContain('href="/admin"');
  });

  it("offers login without exposing admin navigation to guests", () => {
    const html = renderNavigation();

    expect(html).toContain('href="/login"');
    expect(html).toContain(`aria-label="${itMessages.Navigation.login}"`);
    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain('href="/profile"');
    expect(html).not.toContain("<button");
  });

  it("does not flash guest actions while resolving the session", () => {
    useSession.mockReturnValue({ data: null, status: "loading" });
    expect(renderNavigation()).toBe("");
  });

  it("does not duplicate login controls on the login page", () => {
    usePathname.mockReturnValue("/login");
    expect(renderNavigation()).toBe("");
  });
});
