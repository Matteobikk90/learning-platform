import { describe, expect, it } from "vitest";

import { getPurchaseConfirmationEmail } from "@/functions/email/get-purchase-confirmation-email";
import { getWithdrawalAcknowledgementEmail } from "@/functions/email/get-withdrawal-acknowledgement-email";
import { getPurchaseLegalSnapshot } from "@/functions/legal/get-purchase-legal-snapshot";

describe("legal transactional emails", () => {
  it("includes the purchase, legal version and recorded waiver", () => {
    const consentedAt = new Date("2026-08-07T10:00:00.000Z");
    const email = getPurchaseConfirmationEmail({
      amountTotal: 4999,
      appUrl: "https://example.com",
      checkoutLocale: "it",
      courseTitle: "Corso <script>",
      currency: "eur",
      immediateAccessConsentAt: consentedAt,
      legalSections: getPurchaseLegalSnapshot("it"),
      legalTermsVersion: "2026-08-07-draft.1",
      purchaseId: "purchase_1",
      purchasedAt: consentedAt,
      termsAcceptedAt: consentedAt,
      withdrawalWaiverAcknowledgedAt: consentedAt,
    });

    expect(email.text).toContain("perdi l’ordinario diritto di recesso");
    expect(email.text).toContain("2026-08-07-draft.1");
    expect(email.text).toContain("Condizioni contrattuali accettate");
    expect(email.text).toContain("Accesso ai contenuti");
    expect(email.html).toContain("Corso &lt;script&gt;");
    expect(email.html).toContain("/it/legal/withdrawal");
    expect(email.html).not.toContain("<script>");
  });

  it("confirms the withdrawal identity, contract and timestamp", () => {
    const email = getWithdrawalAcknowledgementEmail({
      appUrl: "https://example.com",
      checkoutLocale: "en",
      courseTitle: "Breathwork",
      purchaseId: "purchase_1",
      requestedAt: new Date("2026-08-07T10:00:00.000Z"),
      requesterName: "Alex <Admin>",
    });

    expect(email.text).toContain("purchase_1");
    expect(email.text).toContain("withdrawal declaration");
    expect(email.html).toContain("Alex &lt;Admin&gt;");
    expect(email.html).toContain("/en/profile/purchases");
  });
});
