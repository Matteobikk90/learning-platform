import {
  MAGIC_LINK_MAX_AGE_MINUTES,
  MAGIC_LINK_MAX_AGE_SECONDS,
} from "@/constants/auth";
import { getMagicLinkEmail } from "@/functions/auth/get-magic-link-email";
import { getLocaleFromUrl } from "@/functions/i18n/get-locale-from-url";
import { requireEnv } from "@/lib/env";
import { getResend } from "@/lib/resend";
import type { MagicLinkVerificationRequest } from "@/types/auth";

export function createResendEmailProvider() {
  const from = requireEnv("EMAIL_FROM");
  const sendVerificationRequest = async ({
    identifier,
    url,
  }: MagicLinkVerificationRequest) => {
    const message = getMagicLinkEmail(
      getLocaleFromUrl(url),
      url,
      MAGIC_LINK_MAX_AGE_MINUTES
    );
    const { error } = await getResend().emails.send({
      from,
      to: identifier,
      ...message,
    });

    if (error) {
      throw new Error(`Unable to send verification email: ${error.message}`);
    }
  };
  const options = {
    from,
    maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
    sendVerificationRequest,
  };

  return {
    id: "email",
    type: "email",
    name: "Email",
    server: "resend",
    ...options,
    options,
  } as const;
}
