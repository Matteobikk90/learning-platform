import type Stripe from "stripe";

export type CheckoutCustomer = {
  email: string;
  stripeCustomerId: string | null;
};

export type CheckoutCustomerParams = Pick<
  Stripe.Checkout.SessionCreateParams,
  | "billing_address_collection"
  | "customer"
  | "customer_creation"
  | "customer_email"
  | "customer_update"
>;
