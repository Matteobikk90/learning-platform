import { escapeHtml } from "@/functions/email/escape-html";
import { getLocalizedPath } from "@/functions/i18n/get-localized-path";
import type {
  TransactionalEmail,
  WithdrawalAcknowledgementEmailInput,
} from "@/types/email";

export function getWithdrawalAcknowledgementEmail({
  appUrl,
  checkoutLocale,
  courseTitle,
  purchaseId,
  requestedAt,
  requesterName,
}: WithdrawalAcknowledgementEmailInput): TransactionalEmail {
  const isEnglish = checkoutLocale === "en";
  const formattedDate = new Intl.DateTimeFormat(checkoutLocale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(requestedAt);
  const purchasesUrl = `${appUrl}${getLocalizedPath(
    checkoutLocale,
    "/profile/purchases"
  )}`;
  const safeName = escapeHtml(requesterName);
  const safeCourseTitle = escapeHtml(courseTitle);
  const safePurchaseId = escapeHtml(purchaseId);
  const safeDate = escapeHtml(formattedDate);
  const safePurchasesUrl = escapeHtml(purchasesUrl);

  if (isEnglish) {
    return {
      subject: `Withdrawal request received: ${courseTitle}`,
      text: `Hello ${requesterName},\n\nwe received your withdrawal declaration on ${formattedDate}.\nCourse: ${courseTitle}\nOrder: ${purchaseId}\n\nThe refund is now being processed. You can check its status here: ${purchasesUrl}`,
      html: `<p>Hello ${safeName},</p><p>we received your withdrawal declaration on <strong>${safeDate}</strong>.</p><p><strong>Course:</strong> ${safeCourseTitle}<br><strong>Order:</strong> ${safePurchaseId}</p><p>The refund is now being processed.</p><p><a href="${safePurchasesUrl}">Check your purchase status</a></p>`,
    };
  }

  return {
    subject: `Richiesta di recesso ricevuta: ${courseTitle}`,
    text: `Ciao ${requesterName},\n\nabbiamo ricevuto la tua dichiarazione di recesso il ${formattedDate}.\nCorso: ${courseTitle}\nOrdine: ${purchaseId}\n\nIl rimborso è ora in elaborazione. Puoi verificarne lo stato qui: ${purchasesUrl}`,
    html: `<p>Ciao ${safeName},</p><p>abbiamo ricevuto la tua dichiarazione di recesso il <strong>${safeDate}</strong>.</p><p><strong>Corso:</strong> ${safeCourseTitle}<br><strong>Ordine:</strong> ${safePurchaseId}</p><p>Il rimborso è ora in elaborazione.</p><p><a href="${safePurchasesUrl}">Controlla lo stato dell’acquisto</a></p>`,
  };
}
