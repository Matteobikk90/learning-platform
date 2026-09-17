import type { StaticImageData } from "next/image";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ResponsiveBackgroundImage } from "@/components/responsive-background-image";

const desktopSrc: StaticImageData = {
  src: "/images/desktop-background.jpg",
  width: 2560,
  height: 1440,
};

const mobileSrc: StaticImageData = {
  src: "/images/mobile-background.jpg",
  width: 1440,
  height: 2560,
};

function renderBackground(
  props: Partial<ComponentProps<typeof ResponsiveBackgroundImage>> = {}
) {
  const html = renderToStaticMarkup(
    <ResponsiveBackgroundImage
      desktopSrc={desktopSrc}
      mobileSrc={mobileSrc}
      {...props}
    />
  );

  return {
    html,
    source: html.match(/<source\b[^>]*>/)?.[0] ?? "",
    image: html.match(/<img\b[^>]*>/)?.[0] ?? "",
  };
}

describe("responsive background image", () => {
  it("uses a desktop source and an unconditional mobile fallback without a breakpoint gap", () => {
    const { html, source, image } = renderBackground();

    expect(html).toContain("<picture>");
    expect(html.match(/<source\b/g)).toHaveLength(1);
    expect(source).toContain('media="(min-width: 768px)"');
    expect(source).toContain(encodeURIComponent(desktopSrc.src));
    expect(source).not.toContain(encodeURIComponent(mobileSrc.src));
    expect(image).toContain(encodeURIComponent(mobileSrc.src));
    expect(image).not.toContain(encodeURIComponent(desktopSrc.src));
    expect(image).not.toContain("media=");
    expect(html).not.toContain("max-width: 767px");
  });

  it("retains optimized width candidates for both desktop and mobile", () => {
    const { source, image } = renderBackground();

    for (const tag of [source, image]) {
      expect(tag).toMatch(/srcSet="\/_next\/image\?[^"]+ \d+w/);
      expect(tag).toContain("&amp;q=75");
      expect(tag).toContain('sizes="100vw"');
    }
  });

  it("exposes the dimensions of each source rather than sharing the mobile aspect ratio", () => {
    const { source, image } = renderBackground();

    expect(source).toContain(`width="${desktopSrc.width}"`);
    expect(source).toContain(`height="${desktopSrc.height}"`);
    expect(image).toContain(`width="${mobileSrc.width}"`);
    expect(image).toContain(`height="${mobileSrc.height}"`);
  });

  it("applies a custom responsive size hint to both source sets", () => {
    const sizes = "(min-width: 768px) 178svh, 100vw";
    const { source, image } = renderBackground({ sizes });

    expect(source).toContain(`sizes="${sizes}"`);
    expect(image).toContain(`sizes="${sizes}"`);
  });

  it("keeps decorative backgrounds lazy and preserves their positioning classes", () => {
    const { image } = renderBackground({
      className: "absolute inset-0 size-full object-cover",
    });

    expect(image).toContain('alt=""');
    expect(image).toContain('loading="lazy"');
    expect(image).toContain('decoding="async"');
    expect(image).toContain('class="absolute inset-0 size-full object-cover"');
    expect(image).not.toContain("fetchPriority=");
  });

  it("loads priority backgrounds eagerly with high fetch priority", () => {
    const { image } = renderBackground({ priority: true });

    expect(image).toContain('loading="eager"');
    expect(image).toContain('fetchPriority="high"');
    expect(image).not.toContain('loading="lazy"');
  });
});
