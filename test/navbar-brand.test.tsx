import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { NavbarBrand } from "@/components/navbar-brand";
import { usePathname } from "@/i18n/navigation";

vi.mock("@/i18n/navigation", () => ({
  usePathname: vi.fn(),
  Link: (props: ComponentProps<"a">) => createElement("a", { ...props, "data-next-link": true }),
}));

describe("navbar brand navigation", () => {
  it("uses a native anchor on the homepage, including repeated clicks after scrolling", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const html = renderToStaticMarkup(<NavbarBrand />);

    expect(html).toContain('href="#hero"');
    expect(html).not.toContain("data-next-link");
  });

  it("keeps localized Next navigation back home from other pages", () => {
    vi.mocked(usePathname).mockReturnValue("/courses/example");
    const html = renderToStaticMarkup(<NavbarBrand />);

    expect(html).toContain('href="/#hero"');
    expect(html).toContain('data-next-link="true"');
  });
});
