import { LEGAL_PATHS } from "@/constants/legal";
import { escapeHtml } from "@/functions/email/escape-html";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import type {
  PurchaseConfirmationEmailInput,
  TransactionalEmail,
} from "@/types/email";

export function getPurchaseConfirmationEmail({
  amountTotal,
  appUrl,
  checkoutLocale,
  courseTitle,
  currency,
  immediateAccessConsentAt,
  legalSections,
  legalTermsVersion,
  purchaseId,
  purchasedAt,
  termsAcceptedAt,
  withdrawalWaiverAcknowledgedAt,
}: PurchaseConfirmationEmailInput): TransactionalEmail {
  const isEnglish = checkoutLocale === "en";
  const dateFormatter = new Intl.DateTimeFormat(checkoutLocale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  });
  const formattedDate = dateFormatter.format(purchasedAt);
  const formattedAmount =
    amountTotal !== null && currency
      ? new Intl.NumberFormat(checkoutLocale, {
          style: "currency",
          currency: currency.toUpperCase(),
        }).format(amountTotal / 100)
      : "—";
  const termsUrl = `${appUrl}${getLocalizedPath(checkoutLocale, LEGAL_PATHS.terms)}`;
  const withdrawalUrl = `${appUrl}${getLocalizedPath(
    checkoutLocale,
    LEGAL_PATHS.withdrawal
  )}`;
  const consentRecorded = Boolean(
    legalTermsVersion &&
      termsAcceptedAt &&
      immediateAccessConsentAt &&
      withdrawalWaiverAcknowledgedAt
  );
  const consentText = isEnglish
    ? "You requested immediate performance of the contract and immediate access to the digital content. You acknowledged that, once performance begins, you lose the ordinary 14-day right of withdrawal."
    : "Hai richiesto l’esecuzione immediata del contratto e l’accesso immediato ai contenuti digitali. Hai riconosciuto che, con l’inizio dell’esecuzione, perdi l’ordinario diritto di recesso di 14 giorni.";
  const safeCourseTitle = escapeHtml(courseTitle);
  const safePurchaseId = escapeHtml(purchaseId);
  const safeTermsUrl = escapeHtml(termsUrl);
  const safeWithdrawalUrl = escapeHtml(withdrawalUrl);
  const safeVersion = legalTermsVersion ? escapeHtml(legalTermsVersion) : null;
  const legalText = legalSections
    .flatMap((section) => [section.title, ...section.paragraphs])
    .join("\n\n");
  const legalHtml = legalSections
    .map(
      (section) =>
        `<h3>${escapeHtml(section.title)}</h3>${section.paragraphs
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("")}`
    )
    .join("");

  if (isEnglish) {
    const text = [
      "Your purchase is confirmed.",
      `Course: ${courseTitle}`,
      `Order: ${purchaseId}`,
      `Date: ${formattedDate}`,
      `Total: ${formattedAmount}`,
      consentRecorded ? consentText : null,
      safeVersion ? `Terms version: ${legalTermsVersion}` : null,
      legalSections.length > 0 ? "Accepted contract terms:" : null,
      legalSections.length > 0 ? legalText : null,
      `Terms: ${termsUrl}`,
      `Withdrawal and refunds: ${withdrawalUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      subject: `Purchase confirmed: ${courseTitle}`,
      text,
      html: `<h1>Your purchase is confirmed</h1><p><strong>Course:</strong> ${safeCourseTitle}<br><strong>Order:</strong> ${safePurchaseId}<br><strong>Date:</strong> ${escapeHtml(formattedDate)}<br><strong>Total:</strong> ${escapeHtml(formattedAmount)}</p>${
        consentRecorded ? `<p>${consentText}</p>` : ""
      }${safeVersion ? `<p><strong>Terms version:</strong> ${safeVersion}</p>` : ""}${
        legalSections.length > 0
          ? `<h2>Accepted contract terms</h2>${legalHtml}`
          : ""
      }<p><a href="${safeTermsUrl}">Terms and conditions</a><br><a href="${safeWithdrawalUrl}">Withdrawal and refund policy</a></p>`,
    };
  }

  const text = [
    "Il tuo acquisto è confermato.",
    `Corso: ${courseTitle}`,
    `Ordine: ${purchaseId}`,
    `Data: ${formattedDate}`,
    `Totale: ${formattedAmount}`,
    consentRecorded ? consentText : null,
    safeVersion ? `Versione dei termini: ${legalTermsVersion}` : null,
    legalSections.length > 0 ? "Condizioni contrattuali accettate:" : null,
    legalSections.length > 0 ? legalText : null,
    `Termini: ${termsUrl}`,
    `Recesso e rimborsi: ${withdrawalUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Acquisto confermato: ${courseTitle}`,
    text,
    html: `<h1>Il tuo acquisto è confermato</h1><p><strong>Corso:</strong> ${safeCourseTitle}<br><strong>Ordine:</strong> ${safePurchaseId}<br><strong>Data:</strong> ${escapeHtml(formattedDate)}<br><strong>Totale:</strong> ${escapeHtml(formattedAmount)}</p>${
      consentRecorded ? `<p>${consentText}</p>` : ""
    }${safeVersion ? `<p><strong>Versione dei termini:</strong> ${safeVersion}</p>` : ""}${
      legalSections.length > 0
        ? `<h2>Condizioni contrattuali accettate</h2>${legalHtml}`
        : ""
    }<p><a href="${safeTermsUrl}">Termini e condizioni</a><br><a href="${safeWithdrawalUrl}">Recesso e rimborsi</a></p>`,
  };
}
