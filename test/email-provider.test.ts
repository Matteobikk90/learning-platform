import { beforeEach, describe, expect, it, vi } from "vitest";

const sendEmail = vi.hoisted(() => vi.fn());

vi.mock("@/lib/env", () => ({
  requireEnv: vi.fn(() => "Platform <access@example.com>"),
}));
vi.mock("@/lib/resend", () => ({
  getResend: () => ({ emails: { send: sendEmail } }),
}));

import { MAGIC_LINK_MAX_AGE_SECONDS } from "@/constants/auth";
import { createResendEmailProvider } from "@/functions/auth/create-resend-email-provider";

beforeEach(() => {
  vi.clearAllMocks();
  sendEmail.mockResolvedValue({ error: null });
});

describe("createResendEmailProvider", () => {
  it("builds a NextAuth email provider without an SMTP transport", () => {
    const provider = createResendEmailProvider();

    expect(provider).toMatchObject({
      id: "email",
      type: "email",
      name: "Email",
      server: "resend",
      from: "Platform <access@example.com>",
      maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
    });
  });

  it("sends the localized magic link through Resend", async () => {
    const provider = createResendEmailProvider();
    const url = "https://example.com/en/api/auth/callback/email?token=secret";

    await provider.sendVerificationRequest({
      identifier: "student@example.com",
      url,
    });

    expect(sendEmail).toHaveBeenCalledWith({
      from: "Platform <access@example.com>",
      to: "student@example.com",
      subject: "Sign in to the platform",
      text: expect.stringContaining(url),
      html: expect.stringContaining("Sign in to the platform"),
    });
  });

  it("surfaces Resend delivery errors", async () => {
    sendEmail.mockResolvedValue({ error: { message: "Domain not verified" } });
    const provider = createResendEmailProvider();

    await expect(
      provider.sendVerificationRequest({
        identifier: "student@example.com",
        url: "https://example.com/it/api/auth/callback/email?token=secret",
      })
    ).rejects.toThrow(
      "Unable to send verification email: Domain not verified"
    );
  });
});
