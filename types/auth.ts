export type SignInBody = {
  callbackUrl?: string;
  email?: string;
  json?: string;
};

export type LoginFormProps = {
  callbackUrl: string;
};

export type MagicLinkVerificationRequest = {
  identifier: string;
  url: string;
};
