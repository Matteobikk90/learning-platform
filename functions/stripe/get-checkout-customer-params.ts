import type {
  CheckoutCustomer,
  CheckoutCustomerParams,
} from "@/types/stripe";

export function getCheckoutCustomerParams({
  email,
  stripeCustomerId,
}: CheckoutCustomer): CheckoutCustomerParams {
  const billingAddress = { billing_address_collection: "required" } as const;

  if (stripeCustomerId) {
    return {
      ...billingAddress,
      customer: stripeCustomerId,
      customer_update: {
        address: "auto",
        name: "auto",
      },
    };
  }

  return {
    ...billingAddress,
    customer_creation: "always",
    customer_email: email,
  };
}
