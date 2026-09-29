import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarketingVideo } from "@/components/marketing-video";

describe("MarketingVideo", () => {
  it("renders a Mux player that streams on demand without preloading or tracking", () => {
    const html = renderToStaticMarkup(
      createElement(MarketingVideo, {
        playbackId: "playback-1",
        title: "Presentazione",
        className: "aspect-[9/16]",
      })
    );

    expect(html).toContain("<mux-player");
    expect(html).toContain('stream-type="on-demand"');
    expect(html).toContain('preload="none"');
    expect(html).toContain('disable-tracking=""');
    expect(html).toContain('playsinline=""');
    expect(html).toContain('title="Presentazione"');
    expect(html).toContain('class="block w-full aspect-[9/16]"');
    expect(html).not.toContain("autoplay");
  });
});
