import type { Prisma } from "@prisma/client";

export const ACTIVE_PURCHASE_FILTER = {
  refundedAt: null,
} satisfies Prisma.PurchaseWhereInput;

export const PURCHASE_REFUND_SELECT = {
  id: true,
  amountTotal: true,
  amountRefunded: true,
  createdAt: true,
  currency: true,
  refundedAt: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
  withdrawalRequestedAt: true,
} satisfies Prisma.PurchaseSelect;
