import { describe, expect, it } from "vitest";

import { getCheckoutViewState } from "@/functions/checkout/get-checkout-view-state";

describe("getCheckoutViewState", () => {
  it("is ready once fulfillment completed", () => {
    expect(
      getCheckoutViewState({ isFulfilled: true, sessionStatus: "complete" })
    ).toBe("ready");
  });

  it("keeps async payments in processing until the webhook confirms", () => {
    expect(
      getCheckoutViewState({ isFulfilled: false, sessionStatus: "complete" })
    ).toBe("processing");
  });

  it("stays optimistic when the session could not be retrieved", () => {
    expect(
      getCheckoutViewState({ isFulfilled: false, sessionStatus: null })
    ).toBe("processing");
  });

  it("reports abandoned and expired sessions as not completed", () => {
    expect(
      getCheckoutViewState({ isFulfilled: false, sessionStatus: "open" })
    ).toBe("notCompleted");
    expect(
      getCheckoutViewState({ isFulfilled: false, sessionStatus: "expired" })
    ).toBe("notCompleted");
  });
});
