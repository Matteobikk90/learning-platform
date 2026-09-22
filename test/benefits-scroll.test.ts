import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBenefitsScroll } from "@/hooks/use-benefits-scroll";

const { useEffect, useRef } = vi.hoisted(() => ({
  useEffect: vi.fn(),
  useRef: vi.fn(),
}));

vi.mock("react", () => ({ useEffect, useRef }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    cancelAnimationFrame: vi.fn(),
  });
  vi.stubGlobal("ResizeObserver", class {
    observe = vi.fn();
    disconnect = vi.fn();
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("benefits scroll with header offset", () => {
  it.each([
    ["before sticking", 927, 927, 0],
    ["when reaching the header", 77, 77, 0],
    ["at the middle panel", -746, 77, 0.5],
    ["at the final panel", -1569, 77, 1],
    ["after leaving the section", -1800, -154, 1],
  ])("keeps the correct progress %s", (_label, sectionTop, viewportTop, expected) => {
    const setProperty = vi.fn();
    useRef
      .mockReturnValueOnce({
        current: {
          offsetHeight: 2469,
          getBoundingClientRect: () => ({ top: sectionTop }),
          style: { setProperty },
        },
      })
      .mockReturnValueOnce({
        current: {
          offsetHeight: 823,
          getBoundingClientRect: () => ({ top: viewportTop }),
        },
      });

    useBenefitsScroll();
    const cleanup = useEffect.mock.calls[0][0]();

    expect(setProperty).toHaveBeenCalledWith("--benefit-progress", String(expected));
    cleanup();
  });
});
