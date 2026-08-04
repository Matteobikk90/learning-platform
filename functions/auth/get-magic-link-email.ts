import { escapeHtml } from "@/functions/auth/escape-html";
import type { Locale } from "@/types/i18n";

export function getMagicLinkEmail(
  locale: Locale,
  url: string,
  validityMinutes: number
) {
  const safeUrl = escapeHtml(url);

  if (locale === "en") {
    return {
      subject: "Sign in to the platform",
      text: `Open this link to sign in (valid for ${validityMinutes} minutes): ${url}`,
      html: `<p>Open the link below to sign in. It is valid for ${validityMinutes} minutes.</p><p><a href="${safeUrl}">Sign in to the platform</a></p>`,
    };
  }

  return {
    subject: "Accedi alla piattaforma",
    text: `Apri questo link per accedere (valido ${validityMinutes} minuti): ${url}`,
    html: `<p>Apri il link qui sotto per accedere. È valido per ${validityMinutes} minuti.</p><p><a href="${safeUrl}">Accedi alla piattaforma</a></p>`,
  };
}
