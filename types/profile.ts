import type { Locale } from "@/types/i18n";

export type ProfileFormProps = {
  email: string;
  name: string;
};

export type ProfilePurchaseHistoryItem = {
  id: string;
  amountRefunded: number;
  amountTotal: number | null;
  createdAt: Date;
  currency: string | null;
  refundedAt: Date | null;
  withdrawalRequestedAt: Date | null;
  withdrawalWaiverAcknowledgedAt: Date | null;
  course: { title: string };
};

export type PurchaseHistoryProps = {
  email: string;
  locale: Locale;
  name: string;
  purchases: ProfilePurchaseHistoryItem[];
};
