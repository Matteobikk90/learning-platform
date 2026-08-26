import "server-only";

import { prisma } from "@/lib/prisma";
import type { CheckoutAttemptCustomerReference } from "@/types/checkout";

export async function clearStaleStripeCustomer(
  attempt: CheckoutAttemptCustomerReference
) {
  if (!attempt.stripeCustomerId) return false;

  const result = await prisma.user.updateMany({
    where: {
      id: attempt.userId,
      stripeCustomerId: attempt.stripeCustomerId,
    },
    data: { stripeCustomerId: null },
  });

  return result.count === 1;
}
